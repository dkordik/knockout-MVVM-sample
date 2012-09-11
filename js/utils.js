if (!Number.prototype.toFormattedString) {
    Number.prototype.toFormattedString = function() {
        return this.toString()
	        .split('').reverse().join('')
	        .match(/(.{1,3})/g).join(',')
	        .split('').reverse().join('');
    };
}

if (!String.prototype.toNumber) {
    String.prototype.toNumber = function() {
        return parseInt(this);
    };
}