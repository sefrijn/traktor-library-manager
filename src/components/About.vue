<template>
  <div
    class="h-8 bg-yellow-200 text-black flex-shrink-0 text-xs font-semibold tracking-wider px-2 flex items-center justify-center relative space-x-6"
  >
    <p>
      Free beta version by
      <span
        class="underline text-black font-extrabold cursor-pointer hover:text-black-light"
        @click="openURL('https://mixcloud.com/sefrijn')"
        >DJ Sefrijn</span
      >
      from studio
      <span
        class="underline text-black font-extrabold cursor-pointer hover:text-black-light"
        @click="openURL('https://howaboutyes.com')"
        >How About Yes</span
      >.
    </p>
    <p>Enjoy my work?</p>
    <button
      class="rounded font-bold tracking-wider bg-indigo-800 hover:bg-indigo-600 text-white px-2.5 py-1"
      @click="openURL('https://ko-fi.com/sefrijn')"
    >
      <svg-icon
        type="mdi"
        class="inline-block text-white mr-1"
        :path="iconCoffee"
        size="15"
      ></svg-icon>

      Buy me a coffee
    </button>
    <button
      class="relative -left-4 rounded font-bold tracking-wider bg-yellow-300 hover:bg-yellow-400 hover:text-black px-2.5 py-1 w-32"
      @click="showForm = !showForm"
    >
      {{ buttonText }}
    </button>

    <transition name="fade">
      <form
        v-if="showForm"
        @submit.prevent="submit"
        action=""
        class="bg-yellow-200 m-4 z-50 p-4 pt-0 rounded-md md:w-1/3 sm:w-1/2 w-full absolute right-4 bottom-full flex flex-col space-y-4 items-start shadow-black-lg"
      >
        <span
          @click="showForm = false"
          class="absolute top-2 right-4 text-2xl text-center w-4 cursor-pointer hover:text-black"
          >×</span
        >
        <h1 class="text-xl font-medium">What do you think?</h1>
        <p class="w-full default">
          Write your feedback below. Please specify a bit if you encounter a
          bug. Thanks!
        </p>
        <input
          v-model="contact.name"
          type="text"
          placeholder="Name"
          class="text-sm mt-1 block w-full rounded-md placeholder:text-slate-400 bg-yellow-100 hover:bg-white focus:bg-white border-0"
        />
        <input
          v-model="contact.email"
          type="email"
          placeholder="Email"
          class="text-sm mt-1 block w-full rounded-md placeholder:text-slate-400 bg-yellow-100 hover:bg-white focus:bg-white border-0"
        />
        <textarea
          v-model="contact.body"
          placeholder="Message"
          class="text-sm mt-1 block w-full rounded-md bg-yellow-100 placeholder:text-slate-400 h-36 border-0 hover:bg-white focus:bg-white"
        >
        </textarea>
        <transition name="fade">
          <div
            class="px-4 rounded bg-green-100 text-green-700 w-full flex justify-between items-center"
            v-if="sent"
          >
            <p class="default">Thx! Email sent succesfully.</p>
            <span
              @click="sent = false"
              class="text-2xl text-center w-4 cursor-pointer hover:text-black"
              >×</span
            >
          </div>
        </transition>
        <transition name="fade">
          <div class="text-xs text-red-700" v-if="errors.length">
            <p>Please complete the form:</p>
            <ul class="list-disc list-inside">
              <li v-for="error in errors">{{ error }}</li>
            </ul>
          </div>
        </transition>
        <input
          class="rounded font-bold tracking-wider bg-indigo-800 hover:bg-indigo-600 text-white px-2.5 py-1 cursor-pointer"
          type="submit"
          value="Send"
        />
      </form>
    </transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiCoffeeOutline } from "@mdi/js";

const PHP_MAIL = "https://howaboutyes.com/mailer/index.php";

export default {
  components: {
    SvgIcon,
  },
  data() {
    return {
      iconCoffee: mdiCoffeeOutline,
      contact: {
        name: "",
        email: "",
        body: "",
      },
      errors: [],
      sent: false,
      showForm: false,
    };
  },
  computed: {
    buttonText() {
      return this.showForm ? "Cancel this shit" : "Send Feedback";
    },
  },
  methods: {
    openURL(url) {
      window.ipcRenderer.send("openURL", url);
    },
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
          template_sender: "confirmation_klant",
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
            body: "",
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
      if (!this.contact.body) {
        this.errors.push("Your message is empty.");
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
