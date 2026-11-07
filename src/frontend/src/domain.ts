export type Phase = "draft" | "active" | "waiting" | "paused";
export type Capsule = {
  id: string;
  title: string;
  category: string;
  recipient: string;
  initials: string;
  color: string;
  phase: Phase;
  date: string;
  note: string;
  files: string[];
  policy?: Policy;
};
export type Policy = {
  interval: number;
  waiting: number;
  threshold: number;
  telegram: boolean;
  sms: boolean;
};
export const initialPolicy: Policy = {
  interval: 7,
  waiting: 7,
  threshold: 2,
  telegram: true,
  sms: true,
};
export function policyErrors(p: Policy, accepted: number): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(p.interval) || p.interval < 1 || p.interval > 180)
    errors.push("Интервал проверки: от 1 до 180 дней.");
  if (!Number.isInteger(p.waiting) || p.waiting < 1 || p.waiting > 60)
    errors.push("Период ожидания: от 1 до 60 дней.");
  if (
    !Number.isInteger(p.threshold) ||
    p.threshold < 2 ||
    p.threshold > 5 ||
    p.threshold > accepted
  )
    errors.push(
      "Нужно от 2 до 5 подтверждений и не меньше принявших приглашение доверенных лиц.",
    );
  if (!p.telegram && !p.sms)
    errors.push("Выберите хотя бы один канал проверки.");
  return errors;
}
export function cancelRelease(c: Capsule): Capsule {
  if (c.phase !== "waiting" && c.phase !== "paused")
    throw new Error("Нет активного процесса выдачи.");
  return { ...c, phase: "active" };
}
export const seedCapsules: Capsule[] = [
  {
    id: "family",
    title: "Самое важное для семьи",
    category: "Инструкции",
    recipient: "Алия Самат",
    initials: "АС",
    color: "sage",
    phase: "active",
    date: "7 ноября 2026",
    note: "Демонстрационный пример семейных инструкций. Реальных данных здесь нет.",
    files: ["Пример инструкции.pdf"],
  },
  {
    id: "letter",
    title: "Письмо в будущее",
    category: "Личное сообщение",
    recipient: "Данияр Самат",
    initials: "ДС",
    color: "sand",
    phase: "active",
    date: "5 ноября 2026",
    note: "Здесь будет ваше личное послание человеку, которому вы доверяете.",
    files: [],
  },
  {
    id: "business",
    title: "Дела, которые стоит продолжить",
    category: "Деловые доступы",
    recipient: "Алия Самат",
    initials: "АС",
    color: "lavender",
    phase: "draft",
    date: "3 ноября 2026",
    note: "Пример капсулы с инструкциями по рабочим проектам.",
    files: [],
  },
];
