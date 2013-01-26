<html>
  <head>
    <title>Choppy virus</title>
    <meta charset="UTF-8" />
  <body>
  	<?php
		$query="https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=NOE_interactive&count=1";
		$content = $connection->get($query);
	?>
	</body>
</html>