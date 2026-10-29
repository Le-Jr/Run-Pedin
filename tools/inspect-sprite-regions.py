"""Analisa alpha e grava somente coordenadas; não altera nenhuma imagem."""
import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
regions = {}
for key in ['dad', 'pedin', 'mom', 'son', 'eldest', 'middle']:
    version = 'v2' if key == 'pedin' else 'v1'
    source = root / f'public/assets/characters/{key}-sheet-{version}.png'
    output = subprocess.check_output([
        'magick', str(source), '-alpha', 'extract', '-threshold', '20%',
        '-define', 'connected-components:verbose=true', '-connected-components', '8', 'null:'
    ], text=True)
    frames = {}
    for line in output.splitlines():
        match = re.search(r'\d+: (\d+)x(\d+)\+(\d+)\+(\d+) ([\d.]+),([\d.]+) (\d+) srgb\(255,255,255\)', line)
        if not match:
            continue
        width, height, x, y = map(int, match.group(1, 2, 3, 4))
        cx, cy = map(float, match.group(5, 6))
        if int(match.group(7)) < 2500:
            continue
        row, column = min(3, int(cy / (887 / 4))), min(7, int(cx / (1774 / 8)))
        name = f'row-{row}/{column:02}'
        if name in frames:
            raise RuntimeError(f'Mais de uma figura na mesma célula: {key}/{name}')
        # Margem de 1 pixel para preservar as bordas da silhueta.
        left, top = max(0, x - 1), max(0, y - 1)
        right, bottom = min(1774, x + width + 1), min(887, y + height + 1)
        frames[name] = {'x': left, 'y': top, 'w': right - left, 'h': bottom - top}
    if len(frames) != 32:
        raise RuntimeError(f'{key}: {len(frames)} silhuetas em vez de 32')
    regions[key] = dict(sorted(frames.items()))
    print(f'{key}: {len(frames)} poses identificadas')
(root / 'art/source/generated/frame-regions.json').write_text(json.dumps(regions, indent=2) + '\n')
