const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
    window.location.hash = '';
    const authEndpoint = 'https://accounts.spotify.com/authorize';
    const token = hash.access_token;
    const clientId = 'c7b58b5a47fb49149d5f72a2dd498bdc';
    const redirectUri = 'http://localhost:5500';
    const scopes = [
      'streaming',
      'user-read-private',
      'user-modify-playback-state'
    ];
    if (!token) {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
    }
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'Big Mood',
        getOAuthToken: cb => { cb(token); }
      });
    
      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });
    
      // Playback status updates
      player.addListener('player_state_changed', state => { console.log(state); });
    
      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        //play(device_id);
      });
    
      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });
    
      // Connect to the player!
      player.connect();
    };
    function play(device_id,id) {
      console.log("TokenPlay: " + token);
      $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: '{"uris": ["spotify:track:'+id+'"]}',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + token );},
        success: function(data) { 
          console.log(data)
        },
        failure: function(err) {
          console.log(err);
        }
      });
    }
    function pause(device_id){
      console.log("TokenPause:" + token);
      $.ajax({
        url: "https://api.spotify.com/v1/me/player/pause?device_id=" + device_id,
        type: "PUT",
        data: '{"uris": ["spotify:track:7uenITonAmg7wXmFd3kkms"]}',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + token );},
        success: function(data) { 
          console.log(data)
        },
        failure: function(err) {
          console.log(err);
        }
      });
    }