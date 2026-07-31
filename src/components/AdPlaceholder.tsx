interface AdPlaceholderProps {
  position: "top" | "bottom";
}

export function AdPlaceholder({ position }: AdPlaceholderProps) {
  return (
    <div
      className="ad-placeholder"
      data-slot={position}
      aria-hidden="true"
    />
  );
}
