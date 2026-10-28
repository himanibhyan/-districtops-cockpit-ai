import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional

def extract_fhtc_table(pdf_path: str) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Programmatically parse the Jal Jeevan Mission Har Ghar Jal FHTC report PDF.
    Extracts each State/UT, total households, households with tap water supply,
    reported percentage, calculated percentage, and discrepancy.
    """
    with open(pdf_path, 'rb') as f:
        data = f.read()

    # Match all PDF text Tj operators
    matches = re.findall(rb'\((.*?)\)\s*Tj', data)
    raw_tokens = [m.decode('latin1', errors='ignore').replace('\\(', '(').replace('\\)', ')').strip() for m in matches]

    # Filter out table header tokens
    headers = {
        'Jal Jeevan Mission', 'Har Ghar Jal',
        'Status of households with tap water connection (as on date)',
        'State/ UT', 'Households', 'with tap',
        'water supply', 'water supply (%)'
    }

    clean_tokens = []
    i = 0
    while i < len(raw_tokens):
        t = raw_tokens[i]
        # Skip header 'Total households'
        if t == 'Total' and i + 1 < len(raw_tokens) and raw_tokens[i+1] == 'households':
            i += 2
            continue
        if t in headers or not t or t.startswith('Printed on'):
            i += 1
            continue
        clean_tokens.append(t)
        i += 1

    # Start from Goa
    try:
        start_idx = clean_tokens.index('Goa')
        table_tokens = clean_tokens[start_idx:]
    except ValueError:
        return [], None

    def parse_val(s: str) -> int:
        return int(s.replace(',', '').replace(' ', '').replace('+', ''))

    records: List[Dict[str, Any]] = []
    i = 0
    total_summary = None

    while i < len(table_tokens):
        t = table_tokens[i]
        if t == 'Total':
            if i + 4 < len(table_tokens):
                tot = parse_val(table_tokens[i+1])
                new_conn = parse_val(table_tokens[i+2])
                tap = parse_val(table_tokens[i+3])
                pct = float(table_tokens[i+4])
                total_summary = {
                    'total_households': tot,
                    'new_connections_reported': new_conn,
                    'households_with_tap': tap,
                    'coverage_pct_reported': pct,
                    'coverage_pct_calculated': round((tap / tot) * 100, 2)
                }
            break

        if re.match(r'^[A-Za-z]', t):
            state_name = t
            i += 1
            num_vals = []
            while i < len(table_tokens):
                next_t = table_tokens[i]
                if next_t == 'Total' or re.match(r'^[A-Za-z]', next_t):
                    break
                num_vals.append(next_t)
                i += 1

            if len(num_vals) == 3:
                tot = parse_val(num_vals[0])
                tap = parse_val(num_vals[1])
                pct = float(num_vals[2])
            elif len(num_vals) == 4:
                tot = parse_val(num_vals[0])
                tap = parse_val(num_vals[2])
                pct = float(num_vals[3])
            else:
                continue

            calc_pct = round((tap / tot) * 100, 2)
            records.append({
                'state': state_name,
                'total_households': tot,
                'households_with_tap': tap,
                'coverage_pct_reported': pct,
                'coverage_pct_calculated': calc_pct,
                'coverage_discrepancy': round(abs(pct - calc_pct), 2),
                '_source': 'FHTCDataTable.pdf',
                '_source_classification': 'OFFICIAL',
                '_administrative_level': 'STATE',
                '_report_name': 'Jal Jeevan Mission - Har Ghar Jal FHTC Report',
                '_extraction_method': 'pdf_stream_text_parser'
            })

    return records, total_summary

if __name__ == '__main__':
    default_pdf = Path(__file__).resolve().parents[2] / 'data' / 'fhtc_water_coverage.pdf'
    recs, tot = extract_fhtc_table(str(default_pdf))
    print(f'Total states/UTs extracted: {len(recs)}')
    for idx, r in enumerate(recs, 1):
        print(f"{idx}. {r['state']}: tot={r['total_households']}, tap={r['households_with_tap']}, rep={r['coverage_pct_reported']}%, calc={r['coverage_pct_calculated']}%")
    print('TOTAL SUMMARY:', tot)
