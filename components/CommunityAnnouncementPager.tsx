"use client";

import { Children, isValidElement, useId, useState, type ReactNode } from "react";

export function CommunityAnnouncementPager({ titles, children }: { titles: string[]; children: ReactNode }) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const posts = Children.toArray(children);
  const index = Math.min(selected, posts.length - 1);

  return (
    <section className="community-discussions community-announcements" aria-labelledby={id}>
      <div className="row community-announcement-controls">
        <h3 id={id}>Team announcements</h3>
        {posts.length > 1 && (
          <div className="row" role="group" aria-label="Announcement pages">
            <button className="btn btn-ghost card-action" type="button" aria-label="Previous announcement"
              aria-controls={id + "-posts"} onClick={() => setSelected((index - 1 + posts.length) % posts.length)}>←</button>
            <span className="community-meta" aria-live="polite" aria-atomic="true">
              {index + 1} / {posts.length}<span className="visually-hidden">. {titles[index]}</span>
            </span>
            <button className="btn btn-ghost card-action" type="button" aria-label="Next announcement"
              aria-controls={id + "-posts"} onClick={() => setSelected((index + 1) % posts.length)}>→</button>
          </div>
        )}
      </div>
      <div id={id + "-posts"}>
        {posts.map((post, number) => (
          <div key={isValidElement(post) ? post.key : number} hidden={number !== index}>{post}</div>
        ))}
      </div>
    </section>
  );
}
