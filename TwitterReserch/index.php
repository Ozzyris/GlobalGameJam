<html>
  <head>
    <title>Choppy virus</title>
    <meta charset="UTF-8" />
  <body>
  	<?php

                    //1 - Settings (please update to math your own)
                    $consumer_key='5yqGyFqHm7XFGVW7mWkQ'; //Provide your application consumer key
                    $consumer_secret='8hnopAKJQIy80psTKABiBgZE6vbzmSF6K2V5jT0z4'; //Provide your application consumer secret
                    $oauth_token = '91808934-YRUOYdA4fkisZ5QWHrSfdzh12YJ4onIeiFuNO0Hv5'; //Provide your oAuth Token
                    $oauth_token_secret = 'aJ4amd5tf6bljTVwceTrp4lx27bSIk83QLNJjiddvwY'; //Provide your oAuth Token Secret

                    //You can now copy paste the folowing


                    if(!empty($consumer_key) && !empty($consumer_secret) && !empty($oauth_token) && !empty($oauth_token_secret)) {

                    //2 - Include @abraham's PHP twitteroauth Library
                    require_once('twitteroauth/twitteroauth.php');

                    //3 - Authentication
                    /* Create a TwitterOauth object with consumer/user tokens. */
                    $connection = new TwitterOAuth($consumer_key, $consumer_secret, $oauth_token, $oauth_token_secret);

                    //4 - Start Querying
                    $query = 'http://search.twitter.com/search.json?q='.urlencode('#alex');;

                    $content = $connection->get($query);

                    }

                    /*
                     * Examples
                     *  Verify your connection by displaying your account: $query = 'account/verify_credentials';
                     *  Display a user's timeline: $query = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=NOE_interactive';
                     *  Display a user's latest tweet : $query = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=NOE_interactive&count=1';
                     *  Search for a hastag : $query = 'http://search.twitter.com/search.json?q='.urlencode('#NOE10');
                     */

                    if(!empty($consumer_key) && !empty($consumer_secret) && !empty($oauth_token) && !empty($oauth_token_secret)) {
                            if(!empty($content)){ foreach($content as $tweet){
                                echo'
                                <div class="twitter_status" id="'.$tweet->id_str.'">
                                    <div class="bloc_content">
                                    </div>
                                    <div class="bloc_caption">
                                        <a href="http://twitter.com/'.$tweet->user->screen_name.'">
                                            <img src="'.$tweet->user->profile_image_url.'" alt="@'.$tweet->user->name.'" class="userimg tw_userimg"/>
                                            <span class="username tw_username">@'.$tweet->user->screen_name.'</span>
                                        </a>
                                        <span class="timestamp tw_timestamp">'.date('d M / H:i',strtotime($tweet->created_at)).'</span>
                                    </div>
                                </div>';
                            }}
                                echo'
                            </p>
                            <div class="visualClear"></div>
                        </div>';
                    } else {
                        echo'<p>Please update your settings to provide valid credentials</p>';
                    }
                    echo '</div>';

/*
 * Transform Tweet plain text into clickable text
 */
/*function parseTweet($text) {
    $text = preg_replace('#http://[a-z0-9._/-]+#i', '<a  target="_blank" href="$0">$0</a>', $text); //Link
    $text = preg_replace('#@([a-z0-9_]+)#i', '@<a  target="_blank" href="http://twitter.com/$1">$1</a>', $text); //usernames
    $text = preg_replace('# \#([a-z0-9_-]+)#i', ' #<a target="_blank" href="http://search.twitter.com/search?q=%23$1">$1</a>', $text); //Hashtags
    $text = preg_replace('#https://[a-z0-9._/-]+#i', '<a  target="_blank" href="$0">$0</a>', $text); //Links
    return $text;
}*/

		?>
	</body>
</html>