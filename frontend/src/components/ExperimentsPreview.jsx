const experiments = [
	{
		title: 'Sleep Tracking',
		desc: 'Monitor sleep duration and quality with wearables and daily logs.',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
				<path d="M9.75 3.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V5a.75.75 0 0 1-.75.75h-3A.75.75 0 0 1 9.75 5V3.5z" />
				<path fillRule="evenodd" d="M4.5 7.5A2.25 2.25 0 0 1 6.75 5.25h10.5A2.25 2.25 0 0 1 19.5 7.5v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V7.5zm3 4.125a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75z" clipRule="evenodd" />
			</svg>
		),
	},
	{
		title: 'Diet Monitoring',
		desc: 'Log meals, macros, and hydration to find patterns and improvements.',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
				<path d="M12 2.25a.75.75 0 0 1 .75.75v5.69a4.5 4.5 0 1 1-1.5 0V3a.75.75 0 0 1 .75-.75z" />
				<path d="M7.5 15.75A4.5 4.5 0 0 0 12 20.25a4.5 4.5 0 0 0 4.5-4.5H7.5z" />
			</svg>
		),
	},
	{
		title: 'Fitness Challenge',
		desc: 'Join step, cardio, or strength challenges and compare results.',
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
				<path d="M4.5 3.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75v-15zM9 7.5a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0V7.5zm3 3a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V10.5zm3 2.25a.75.75 0 0 0-1.5 0V15a.75.75 0 0 0 1.5 0v-2.25z" />
			</svg>
		),
	},
]

function ExperimentsPreview() {
	return (
		<section id="experiments" className="py-16 bg-white">
			<div className="container-responsive">
				<div className="flex items-end justify-between gap-4 mb-8">
					<h2 className="font-champ text-3xl sm:text-4xl text-accent">Experiments</h2>
					<a href="#all-experiments" className="hidden sm:inline-flex items-center text-accent hover:underline font-semibold">View all</a>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{experiments.map((e) => (
						<article key={e.title} className="group rounded-2xl ring-1 ring-secondary/70 bg-white p-6 shadow-card hover:-translate-y-0.5 hover:shadow-lg transition-all">
							<div className="h-12 w-12 rounded-lg bg-secondary text-accent flex items-center justify-center">
								{e.icon}
							</div>
							<h3 className="mt-4 text-xl font-bold text-slate-900">{e.title}</h3>
							<p className="mt-2 text-slate-700 text-sm leading-relaxed">{e.desc}</p>
							<div className="mt-5">
								<button className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white font-semibold shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors">
									View More
								</button>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}

export default ExperimentsPreview


