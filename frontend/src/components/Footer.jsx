function Footer() {
	return (
		<footer id="contact" className="mt-16 border-t border-secondary/60 bg-white">
			<div className="container-responsive py-10">
				<div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold">HL</div>
						<span className="font-champ text-xl tracking-wide text-accent">Health Lab</span>
					</div>
					<nav className="flex items-center gap-6 text-slate-700 font-medium">
						<a className="hover:text-accent transition-colors" href="#">Privacy Policy</a>
						<a className="hover:text-accent transition-colors" href="#">Terms</a>
						<a className="hover:text-accent transition-colors" href="#contact">Contact</a>
					</nav>
					<div className="flex items-center gap-4 text-accent">
						<a aria-label="Twitter" href="#" className="hover:opacity-80 transition-opacity">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M19.633 7.997c.013.176.013.353.013.53 0 5.39-4.103 11.607-11.607 11.607-2.306 0-4.45-.674-6.253-1.834.325.038.637.05.975.05a8.2 8.2 0 0 0 5.085-1.748 4.1 4.1 0 0 1-3.827-2.842c.26.038.52.063.793.063.377 0 .755-.05 1.107-.138A4.093 4.093 0 0 1 2.8 9.56v-.05c.55.303 1.19.49 1.87.514A4.087 4.087 0 0 1 2.78 6.7a11.61 11.61 0 0 0 8.422 4.274 4.61 4.61 0 0 1-.101-.939A4.09 4.09 0 0 1 15.19 6.03a8.05 8.05 0 0 0 2.595-.988 4.1 4.1 0 0 1-1.798 2.258 8.173 8.173 0 0 0 2.356-.637 8.808 8.808 0 0 1-1.71 2.334z" /></svg>
						</a>
						<a aria-label="GitHub" href="#" className="hover:opacity-80 transition-opacity">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.021c0 4.424 2.865 8.176 6.839 9.504.5.092.682-.218.682-.484 0-.237-.009-.866-.014-1.7-2.782.607-3.369-1.346-3.369-1.346-.454-1.157-1.11-1.466-1.11-1.466-.908-.622.07-.61.07-.61 1.003.07 1.531 1.033 1.531 1.033.892 1.532 2.341 1.09 2.91.834.091-.651.35-1.09.636-1.341-2.22-.253-4.555-1.112-4.555-4.95 0-1.094.39-1.99 1.03-2.69-.104-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0 1 12 6.845c.85.004 1.705.115 2.504.337 1.909-1.297 2.748-1.027 2.748-1.027.546 1.378.203 2.397.1 2.65.64.7 1.028 1.596 1.028 2.69 0 3.847-2.339 4.694-4.566 4.943.36.311.682.922.682 1.86 0 1.342-.013 2.425-.013 2.756 0 .269.18.581.688.482C19.138 20.193 22 16.443 22 12.02 22 6.486 17.523 2 12 2z" clipRule="evenodd"/></svg>
						</a>
						<a aria-label="LinkedIn" href="#" className="hover:opacity-80 transition-opacity">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4.983 3.5C3.88 3.5 3 4.38 3 5.483c0 1.102.88 1.982 1.983 1.982 1.102 0 1.982-.88 1.982-1.982C6.965 4.38 6.085 3.5 4.983 3.5zM3.36 8.567h3.246V21H3.36V8.567zM9.318 8.567h3.112v1.688h.044c.434-.823 1.49-1.689 3.067-1.689 3.279 0 3.884 2.157 3.884 4.964V21h-3.246v-5.5c0-1.312-.024-3-1.828-3-1.828 0-2.108 1.43-2.108 2.907V21H9.318V8.567z"/></svg>
						</a>
					</div>
				</div>
				<p className="mt-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} Health Lab. All rights reserved.</p>
			</div>
		</footer>
	)
}

export default Footer


