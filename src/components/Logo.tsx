import Image from "next/image";

type LogoProps = {
  size?: number;
  invert?: boolean;
  showText?: boolean;
};

export default function Logo({ size = 36, invert = false, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer">
      <Image
        src="/images/logo-diose.png"
        alt="DIOSE"
        width={size}
        height={size}
        className={invert ? "invert" : ""}
        priority
      />
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-heading text-xl leading-none tracking-[0.08em] ${
              invert ? "text-diose-black" : "text-white"
            }`}
          >
            DIOSE
          </span>
          <span
            className={`text-[9px] leading-none tracking-[0.06em] mt-0.5 ${
              invert ? "text-gray-500" : "text-white/50"
            }`}
          >
            Distribuidora de obras y servicios
          </span>
        </div>
      )}
    </div>
  );
}
