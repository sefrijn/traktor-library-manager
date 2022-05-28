export default {
    methods: {
        fancyTimeFormat(duration, prependZero = false) {
            // Hours, minutes and seconds
            var hrs = ~~(duration / 3600);
            var mins = ~~((duration % 3600) / 60);
            var secs = ~~duration % 60;

            // Output like "1:01" or "4:03:59" or "123:03:59"
            var ret = '';

            if (hrs > 0) {
                ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
            }

            ret +=
                (mins < 10 && prependZero ? '0' : '') +
                mins +
                ':' +
                (secs < 10 ? '0' : '');
            ret += '' + secs;
            return ret;
        },
    },
};
