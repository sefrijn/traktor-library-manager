<template>
	<aside class="w-full h-full relative flex" v-if="!pathToLibrary">
		<img
			src="./../assets/welcome.png"
			alt=""
			class="absolute top-0 left-0 w-full h-full object-cover z-0"
		/>
		<div
			class="z-10 w-full text-white flex flex-col items-center
	 justify-center "
		>
			<img
				class="w-auto mr-1 -mt-5"
				style="height:120px;"
				src="./../assets/logo-bw@2x.png"
				alt=""
			/>
			<h3>Welcome to</h3>
			<h1>Traktor <span class="font-light">Pro</span> 3</h1>
			<h2>Library Manager</h2>
			<div class="mt-5 max-w-prose text-center text-white font-medium">
				<p>
					A tool build by Sefrijn to help you manage your library.
				</p>
			</div>
			<div
				v-if="sent"
				class="mt-1 max-w-prose text-center text-white font-medium"
			>
				<p>Open a .NML Library file on your computer to start:</p>
				<div class="mt-4 flex w-full items-center justify-center">
					<btn-open-library
						:size="24"
						text="Open library"
						:tooltip="false"
					></btn-open-library>
				</div>
			</div>

			<form
				v-if="!sent"
				@submit.prevent="submit"
				action=""
				class="mt-5 max-w-sm flex flex-col space-y-2 items-start font-medium"
			>
				<p class="text-center">
					Enter name & valid email to receive updates and bugfixes for
					this free beta version.
				</p>
				<input
					v-model="contact.name"
					type="text"
					placeholder="Name"
					class="text-sm text-black mt-1 block w-full placeholder:text-slate-400 bg-white opacity-80 hover:opacity-100 focus:opacity-100 focus:bg-white border-0"
				/>
				<input
					v-model="contact.email"
					type="email"
					placeholder="Email"
					class="text-sm text-black mt-1 block w-full placeholder:text-slate-400 bg-white opacity-80 hover:opacity-100 focus:opacity-100 focus:bg-white border-0"
				/>
				<input
					class="bg-active hover:bg-active-dark font-bold tracking-wider text-white px-2.5 py-1 cursor-pointer"
					type="submit"
					value="Send"
				/>
				<transition name="fade">
					<div
						class="text-sm text-red-800 w-full"
						v-if="errors.length"
					>
						<p>Please complete the form:</p>
						<ul class="list-disc list-inside">
							<li v-for="error in errors">{{ error }}</li>
						</ul>
					</div>
				</transition>
			</form>
		</div>
	</aside>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}

h1,
h2,
h3 {
	display: block;
	text-align: center;
}
p {
	@apply text-lg;
}
p,
img,
h1,
h2,
h3 {
	@apply filter drop-shadow-md;
}
h1 {
	@apply text-5xl font-extrabold uppercase tracking-wider mt-0;
}
h2 {
	@apply text-5xl font-bold text-black;
}
h3 {
	@apply text-2xl font-bold text-white;
}
</style>

<script>
import BtnOpenLibrary from "./BtnOpenLibrary.vue";

const PHP_MAIL = "https://howaboutyes.com/mailer/index.php";

export default {
	components: {
		BtnOpenLibrary,
	},
	data() {
		return {
			contact: {
				name: "",
				email: "",
				message: "New User for Traktor Library Manager",
			},
			errors: [],
			sent: false,
		};
	},
	computed: {
		pathToLibrary() {
			return this.$store.getters.libraryPath;
		},
	},
	methods: {
		sendMail() {
			fetch(PHP_MAIL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					...this.contact,
					href: window.location.href,
				}),
			})
				.then((response) => {
					response.json().then((data) => {
						console.log(data);
					});
					this.sent = true;
					this.contact = {
						name: "",
						email: "",
					};
				})
				.catch((error) => {
					console.log(error);
				});
		},
		submit() {
			this.errors = [];

			if (!this.contact.name) {
				this.errors.push("Enter your name.");
			}
			if (!this.contact.email) {
				this.errors.push("Enter a valid email address.");
			} else if (!this.validEmail(this.contact.email)) {
				this.errors.push("Valid email required.");
			}
			if (this.errors.length < 1) {
				console.log("send mail");
				this.sendMail();
			}
		},
		validEmail: function(email) {
			var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},
	},
};
</script>
