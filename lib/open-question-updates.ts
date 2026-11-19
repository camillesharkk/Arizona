export const questionUpdatesEvent = "notary-open-question-updates";

export function openQuestionUpdates(id?: string) {
  window.dispatchEvent(new CustomEvent(questionUpdatesEvent, { detail: id }));
}
