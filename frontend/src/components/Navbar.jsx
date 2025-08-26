function Navbar() {
	return (
		<header className="sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-secondary/60">
			<div className="container-responsive flex items-center justify-between py-4">
				<div className="flex items-center gap-2">
					<div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-white font-bold">HL</div>
					<span className="font-champ text-2xl tracking-wide text-accent">Health Lab</span>
				</div>
				<nav className="hidden md:flex items-center gap-8 text-slate-700 font-medium">
					<a className="hover:text-accent transition-colors" href="#home">Home</a>
					<a className="hover:text-accent transition-colors" href="#experiments">Experiments</a>
					<a className="hover:text-accent transition-colors" href="#about">About</a>
					<a className="hover:text-accent transition-colors" href="#contact">Contact</a>
				</nav>
				<div className="hidden md:block">
					<a href="#join" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white font-semibold shadow-sm hover:shadow-md hover:bg-accent transition-all">Join Now</a>
				</div>
			</div>
		</header>
	)
}

export default Navbar


