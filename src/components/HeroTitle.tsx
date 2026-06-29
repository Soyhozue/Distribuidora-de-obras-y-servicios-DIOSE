import { Fragment } from "react";

export default function HeroTitle({
  title,
  highlight,
  className,
}: {
  title: string;
  highlight: string;
  className?: string;
}) {
  const lines = title.split("\n");

  return (
    <h1 className={className}>
      {lines.map((line, i) => {
        const idx = highlight ? line.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
        return (
          <Fragment key={i}>
            {idx === -1 ? (
              line
            ) : (
              <>
                {line.slice(0, idx)}
                <span className="text-diose-amber">{line.slice(idx, idx + highlight.length)}</span>
                {line.slice(idx + highlight.length)}
              </>
            )}
            {i < lines.length - 1 && <br />}
          </Fragment>
        );
      })}
    </h1>
  );
}
