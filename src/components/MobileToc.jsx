export default function MobileToc({ toc }) {
  if (!toc) return null;
  return (
    <div className="mobtoc">
      {toc.map((item) => (
        <a key={item.id} href={`#${item.id}`}>{item.num} {item.label}</a>
      ))}
    </div>
  );
}
