export default function Header() {
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
      <div className="w-full flex justify-center items-center">
        <img src="/gmmco-logo.png" alt="Logo" className="w-[280px] h-[150px]" />
      </div>

      <div className="mb-4 flex h-auto w-full items-end text-center font-bold lg:static lg:w-auto lg:bg-none lg:mb-0 justify-center">
        <span className="text-3xl">GMMCO Assistant</span>
      </div>
    </div>
  );
}
