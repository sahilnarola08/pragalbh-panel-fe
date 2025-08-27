import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/main.svg";
import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width, height }: LogoProps) {
  if (width && height) {
    return (
      <div className="relative">
        <Image
          src={logo}
          width={width}
          height={height}
          className="dark:hidden"
          alt="NextAdmin logo"
          role="presentation"
          quality={100}
        />

        <Image
          src={darkLogo}
          width={width}
          height={height}
          className="hidden dark:block"
          alt="NextAdmin logo"
          role="presentation"
          quality={100}
        />
      </div>
    );
  }

  return (
    <div className="relative h-8 max-w-[10.847rem]">
      <Image
        src={logo}
        fill
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
