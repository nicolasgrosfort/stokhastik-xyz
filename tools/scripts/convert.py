from pathlib import Path
import argparse
import numpy as np
from plyfile import PlyData, PlyElement

C0 = 0.28209479177387814


def convert_ply(input_path: Path, output_path: Path):
    ply = PlyData.read(str(input_path))
    v = ply["vertex"].data

    required = {"x", "y", "z", "f_dc_0", "f_dc_1", "f_dc_2"}
    available = set(v.dtype.names or ())
    missing = required - available
    if missing:
        raise ValueError(f"Propriétés manquantes dans {input_path}: {', '.join(sorted(missing))}")

    pos = np.vstack([v["x"], v["y"], v["z"]]).T.astype(np.float32)
    f_dc = np.vstack([v["f_dc_0"], v["f_dc_1"], v["f_dc_2"]]).T
    rgb = np.clip(f_dc * C0 + 0.5, 0.0, 1.0)
    rgb_u8 = (rgb * 255).astype(np.uint8)

    vertex = np.empty(len(v), dtype=[
        ("x", "f4"), ("y", "f4"), ("z", "f4"),
        ("red", "u1"), ("green", "u1"), ("blue", "u1"),
    ])
    vertex["x"], vertex["y"], vertex["z"] = pos.T
    vertex["red"], vertex["green"], vertex["blue"] = rgb_u8.T

    output_path.parent.mkdir(parents=True, exist_ok=True)
    PlyData([PlyElement.describe(vertex, "vertex")], text=False).write(str(output_path))
    print(f"✔ {input_path} -> {output_path} ({len(v)} points)")


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
    parser = argparse.ArgumentParser(description="Convert one ML-Sharp PLY or a folder recursively to RGB PLY")
    parser.add_argument("input", help="PLY file or input folder")
    parser.add_argument("-o", "--output", help="Output PLY (single-file mode only)")
    parser.add_argument("--output-dir", help="Output folder (directory mode); preserves subfolders")
    args = parser.parse_args()

    source = Path(args.input).expanduser().resolve()

    if source.is_file():
        output = Path(args.output).expanduser() if args.output else source.with_name(f"{source.stem}_converted.ply")
        convert_ply(source, output.resolve())
        return

    if not args.output_dir:
        parser.error("--output-dir est requis lorsque l'entrée est un dossier")

    destination = Path(args.output_dir).expanduser().resolve()
    files = list(iter_ply(source))
    print(f"{len(files)} fichier(s) PLY trouvé(s)")

    for file in files:
        relative = file.relative_to(source)
        try:
            convert_ply(file, destination / relative)
        except Exception as e:
            print(f"✘ {file}: {e}")


if __name__ == "__main__":
    main()
