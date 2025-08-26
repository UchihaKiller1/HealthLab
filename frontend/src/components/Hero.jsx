function Hero() {
	return (
		<section id="home" className="relative overflow-hidden">
			<div className="absolute inset-0 -z-10">
				<div className="h-[600px] sm:h-[700px] bg-gradient-to-b from-secondary/70 via-white to-white" />
				<div className="absolute right-[-10%] top-[-10%] h-80 w-80 sm:h-[28rem] sm:w-[28rem] rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute left-[-10%] top-[30%] h-72 w-72 sm:h-[24rem] sm:w-[24rem] rounded-full bg-accent/10 blur-3xl" />
			</div>
			<div className="container-responsive pt-16 sm:pt-24 pb-12 sm:pb-20 grid md:grid-cols-2 items-center gap-10">
				<div>
					<h1 className="font-champ text-4xl sm:text-5xl lg:text-6xl tracking-wide text-accent">
						Explore Cloud-Powered Health Experiments
					</h1>
					<p className="mt-4 text-lg text-slate-700 max-w-prose">
						Track your sleep, diet, and fitness, and get inspired by others’ results.
					</p>
					<div className="mt-8 flex flex-col sm:flex-row gap-3">
						<a href="#experiments" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-semibold shadow-sm hover:shadow-md hover:bg-accent transition-all">
							Start Experiment
						</a>
						<a href="#about" className="inline-flex items-center justify-center rounded-lg border border-accent/30 px-6 py-3 text-accent font-semibold hover:border-accent hover:bg-accent/5 transition-colors">
							Learn More
						</a>
					</div>
				</div>
				<div className="relative">
					<div className="mx-auto max-w-md md:max-w-none">
						<div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary via-white to-secondary shadow-card ring-1 ring-secondary/60 flex items-center justify-center">
							<div className="grid grid-cols-3 gap-4 p-6 w-full">
								<div className="h-20 rounded-lg bg-primary/20 animate-pulse" />
								<div className="h-28 rounded-lg bg-accent/20 animate-pulse delay-100" />
								<div className="h-16 rounded-lg bg-primary/10 animate-pulse delay-200" />
								<div className="h-24 rounded-lg bg-accent/10 animate-pulse" />
								<div className="h-16 rounded-lg bg-primary/20 animate-pulse delay-100" />
								<div className="h-28 rounded-lg bg-accent/20 animate-pulse delay-200" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Hero


