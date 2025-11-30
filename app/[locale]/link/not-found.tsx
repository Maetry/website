import Link from "next/link";

const InviteNotFound = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black dark:bg-dark-bg dark:text-dark-text">
      <div className="flex max-w-lg flex-col gap-3">
        <h1 className="text-3xl font-semibold md:text-4xl">Ссылка недоступна</h1>
        <p className="text-base text-black/70 dark:text-white/70">
          Возможно, приглашение устарело или было отозвано. Попросите инициатора отправить новую ссылку или перейдите на
          сайт Maetry.
        </p>
      </div>
      <Link
        href="https://maetry.com"
        className="rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus-visible:ring-white dark:focus-visible:ring-offset-dark-bg"
      >
        Перейти на maetry.com
      </Link>
    </main>
  );
};

export default InviteNotFound;

