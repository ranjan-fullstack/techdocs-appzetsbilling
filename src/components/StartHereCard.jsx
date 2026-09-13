export default function StartHereCard({ items, note }) {
  return (
    <div className="starthere">
      <div className="starthere-title">New here? Start with what you're trying to do</div>
      <div className="starthere-list">
        {items.map((it) => (
          <a key={it.q} href={it.href} className="starthere-item">
            <span className="starthere-q">{it.q}</span>
            <span className="starthere-a">→ {it.a}</span>
          </a>
        ))}
      </div>
      {note && <div className="starthere-note">{note}</div>}
    </div>
  );
}
