const getDummyData = require("../utils/getDummyData");

module.exports = {
    channels : {},

    index: function() {
    },

    create: function() {
        let channelId = Math.floor(Math.random() * Math.floor(3000000));
        
        while(this.channels.hasOwnProperty(channelId)) {
            channelId = Math.floor(Math.random() * Math.floor(3000000));
        }

        this.channels[channelId] = {
            count: 0
        };

        return channelId;
    },

    addClient: function(username) {
        
        // second client joining find first channel with count < 2
        let channelId = null;

        for(let i in this.channels) {
            if(this.channels && this.channels[i]['count'] && this.channels[i]['count'] < 2) {
                channelId = i;
                break;
            }
        }

        if(!channelId) {
            channelId = this.create();
            this.channels[channelId]['text'] = getDummyData();
        }

        this.channels[channelId]['count'] += 1;
        this.channels[channelId][username] = {};

        return channelId;
    },

    hasBothClient: function(channelId) {
        return this.channels[channelId]['count'] > 1;
    },

    getChannelText: function(channelId) {
        return this.channels[channelId]['text'];
    },

    delete: function(channelId) {
        delete this.channels[channelId];
        return true;
    },
}