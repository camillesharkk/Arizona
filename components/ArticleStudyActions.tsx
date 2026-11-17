import { ArticleLink } from '@/components/ArticleLink';
import { articleStudyActions } from '@/lib/article-study-actions';
import type { StateCode } from '@/lib/types';

export function ArticleStudyActions({ state, articleId }: { state: StateCode; articleId: string }) {
  const actions = articleStudyActions(state);
  return (
    <section className="card" style={{ marginTop: 24 }} aria-label="Continue studying">
      <h2>Put this into practice</h2>
      <p>Try a short question set to find gaps. Use the Study Guide to review the rules behind your answers, then practise across topics.</p>
      <div className="tool-row">
        {actions.map(action => (
          <ArticleLink key={action.targetMode} articleId={articleId} articleState={state}
            href={action.href} label={action.label} placement={action.placement} targetMode={action.targetMode}
            className={action.targetMode === 'quick' ? 'btn btn-primary' : 'chip'} />
        ))}
      </div>
    </section>
  );
}
