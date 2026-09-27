from pathlib import Path
import argparse
import numpy as np
from plyfile import PlyData, PlyElement


def decimate_ply(input_path: Path, output_path: Path, ratio: float):
    if not 0 < ratio <= 1:
        raise ValueError("--ratio doit être supérieur à 0 et inférieur ou égal à 1")

    ply = PlyData.read(str(input_path))
    v = ply["vertex"].data
    n = len(v)
    keep_n = max(1, int(n * ratio)) if n else 0

    if keep_n < n:
        indices = np.random.choice(n, keep_n, replace=False)
        v = v[indices]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    PlyData([PlyElement.describe(v, "vertex")], text=False).write(str(output_path))
    print(f"✔ {input_path} -> {output_path} ({n} -> {len(v)} points)")


def iter_ply(input_path: Path):
    if input_path.is_file():
        if input_path.suffix.lower() != ".ply":
            raise ValueError("Le fichier d'entrée doit être un .ply")
        yield input_path
    elif input_path.is_dir():
        yield from sorted(p for p in input_path.rglob("*") if p.is_file() and p.suffix.lower() == ".ply")
    else:
        raise FileNotFoundError(input_path)


def main():
    parser = argparse.ArgumentParser(description="Decimate one PLY point cloud or a folder recursively")
    parser.add_argument("input", help="PLY file or input folder")
    parser.add_argument("-o", "--output", help="Output PLY (single-file mode only)")
    parser.add_argument("--output-dir", help="Output folder (directory mode); preserves subfolders")
    parser.add_argument("--ratio", type=float, default=0.3, help="Decimation ratio (0-1), default: 0.3")
    args = parser.parse_args()

    source = Path(args.input).expanduser().resolve()

    if source.is_file():
        output = Path(args.output).expanduser() if args.output else source.with_name(f"{source.stem}_decimated.ply")
        decimate_ply(source, output.resolve(), args.ratio)
        return

    if not args.output_dir:
        parser.error("--output-dir est requis lorsque l'entrée est un dossier")

    destination = Path(args.output_dir).expanduser().resolve()
    files = list(iter_ply(source))
    print(f"{len(files)} fichier(s) PLY trouvé(s)")

    for file in files:
        relative = file.relative_to(source)
        try:
            decimate_ply(file, destination / relative, args.ratio)
        except Exception as e:
            print(f"✘ {file}: {e}")


if __name__ == "__main__":
    main()
