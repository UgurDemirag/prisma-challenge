with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "prisma";
  buildInputs = [ nodejs ];
}
