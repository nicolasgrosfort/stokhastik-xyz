from pathlib import Path
import argparse
import numpy as np
from plyfile import PlyData


def rotation_matrix(axis: str, degrees: float) -> np.ndarray:
    radians = np.radians(degrees)
    c, s = np.cos(radians), np.sin(radians)

    if axis == "x":
        return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == "y":
        return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    if axis == "z":
        return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    raise ValueError(f"Axe invalide: {axis}. Utilisez 'x', 'y' ou 'z'.")


def rotate_ply(input_path: Path, output_path: Path, rx=0, ry=0, rz=0):
    plydata = PlyData.read(str(input_path))
    vertex = plydata["vertex"]

    coords = np.stack([
        np.asarray(vertex["x"], dtype=np.float64),
        np.asarray(vertex["y"], dtype=np.float64),
        np.asarray(vertex["z"], dtype=np.float64),
    ], axis=-1)

    R = rotation_matrix("z", rz) @ rotation_matrix("y", ry) @ rotation_matrix("x", rx)
    rotated = (R @ coords.T).T

    vertex["x"] = rotated[:, 0].astype(np.float32)
    vertex["y"] = rotated[:, 1].astype(np.float32)
    vertex["z"] = rotated[:, 2].astype(np.float32)

    properties = {p.name for p in vertex.properties}
    if {"nx", "ny", "nz"}.issubset(properties):
        normals = np.stack([
            np.asarray(vertex["nx"], dtype=np.float64),
            np.asarray(vertex["ny"], dtype=np.float64),
            np.asarray(vertex["nz"], dtype=np.float64),
        ], axis=-1)
        rotated_normals = (R @ normals.T).T
        vertex["nx"] = rotated_normals[:, 0].astype(np.float32)
        vertex["ny"] = rotated_normals[:, 1].astype(np.float32)
        vertex["nz"] = rotated_normals[:, 2].astype(np.float32)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    plydata.write(str(output_path))
    print(f"✔ {input_path} -> {output_path}")


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
    parser = argparse.ArgumentParser(description="Rotate one PLY or all PLY files in a folder recursively")
    parser.add_argument("input", help="PLY file or input folder")
    parser.add_argument("-o", "--output", help="Output PLY (single-file mode only)")
    parser.add_argument("--output-dir", help="Output folder (directory mode); preserves subfolders")
    parser.add_argument("-x", "--rx", type=float, default=0)
    parser.add_argument("-y", "--ry", type=float, default=0)
    parser.add_argument("-z", "--rz", type=float, default=0)
    args = parser.parse_args()

    source = Path(args.input).expanduser().resolve()

    if source.is_file():
        output = Path(args.output).expanduser() if args.output else source.with_name(f"{source.stem}_rotated.ply")
        rotate_ply(source, output.resolve(), args.rx, args.ry, args.rz)
        return

    if not args.output_dir:
        parser.error("--output-dir est requis lorsque l'entrée est un dossier")

    destination = Path(args.output_dir).expanduser().resolve()
    files = list(iter_ply(source))
    print(f"{len(files)} fichier(s) PLY trouvé(s)")

    for file in files:
        relative = file.relative_to(source)
        rotate_ply(file, destination / relative, args.rx, args.ry, args.rz)


if __name__ == "__main__":
    main()
