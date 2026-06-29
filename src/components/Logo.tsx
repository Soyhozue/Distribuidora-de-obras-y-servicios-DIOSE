import Image from "next/image";

type LogoProps = {
  size?: number;
  invert?: boolean;
};

export default function Logo({ size = 36, invert = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <Image
        src="/images/logo-diose.png"
        alt="DIOSE"
        width={size}
        height={size}
        className={invert ? "invert" : ""}
        priority
      />
    </div>
  );
}
