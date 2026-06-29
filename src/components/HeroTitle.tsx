import { Fragment } from "react";

export default function HeroTitle({
  title,
  highlight,
  highlightColor,
  className,
}: {
  title: string;
  highlight: string;
  highlightColor: string;
  className?: string;
}) {
  const lines = title.split("\n");

  const textShadow = "0 2px 4px rgba(0,0,0,0.95), 0 4px 18px rgba(0,0,0,0.85), 0 1px 1px rgba(0,0,0,1)";

  return (
    <h1 className={className} style={{ textShadow }}>
      {lines.map((line, i) => {
        const idx = highlight ? line.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
        return (
          <Fragment key={i}>
            {idx === -1 ? (
              line
            ) : (
              <>
                {line.slice(0, idx)}
                <span style={{ color: highlightColor }}>{line.slice(idx, idx + highlight.length)}</span>
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
