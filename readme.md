##### Dashboard displaying most recent 5 calls:
`http://view-saved-vanity-numbers.s3-website-us-east-1.amazonaws.com/index.html`

##### Number to call to generate vanity numbers from the phone you are calling from:
`(312) 265-5426`

##### Architecture diagram:
`s3 link`

#### Writing and Documentation:

1. Record your reasons for implementing the solution the way you did, struggles you faced and problems you overcame.

    Retrieving the best 5 vanity numbers was a challenge. I thought of a number of solutions for this, including 
    implementing a grammar API that phrases could be passed and good grammar comes back with some type of rating. 
    However, this might eliminate certain desirable results with duplicate words or with local grammatically-incorrect lingo. 
    I chose to set the word-pool to the top 5000 used english words and prioritized results toward the longest words.
    This heuristic produces memorable, longer words that should be easier to remember.
    To improve these results, I'd be inclined to save all items to a DB and let a user parse through the results. 
    Most phone numbers didn't produce more than a few dozen results; some produced none. 
    
    The architecture of the project was more or less set from the requirements, and those were the best choices given 
    the requirements. I implemented the web-app independently, and given its simple nature, the static hosting S3
    bucket was the most elegant.

2. What shortcuts did you take that would be a bad practice in production?

    There should be some security around the exposed API which retrieves data from DynamoDB. It's currently open, but 
    would need to be behind authentication in production. I'd want to dive deeper into Amazon Connect since this was 
    my first time using this specific service. My solution works when calling the number, but there may be more architecture
    that would make this a more secure solution that I'm unaware of. There is not a great deal of automated testing, 
    but I did include several lambda tests in the `./test'` folder. 
   
3. What would you have done with more time? We know you have a life. :-)

    I'd essentially like to test this more broadly, review with the client to suggest improvements, such as saving all 
    vanity numbers in a DB and having those available for a human to parse them. The spoken interface isn't very nimble. 
    I'd implement more security and probably do some refactor of the vanity number generation algorithm. It probably 
    could be done more elegantly with recursion. I'm sure that a client would have suggestions and after a few iterations
    and conversations, we'd be able to add functionality to have a great product delivered. 

4. What other considerations would you make before making our toy app into something that would be ready for high volumes of traffic, potential attacks from bad folks, etc.

    There are probably some scaling and security considerations in Amazon Connect that I'm not currently aware of. I'd certainly
    implement security for the web-app viewer. I might set alarms and monitoring of all the resources being used, perhaps
    tag them for consolidated billing insights. 

5. Please include an architecture diagram.

    The solution was implemented using AWS Connect, DynamoDB, Lambda, API Gateway, and S3. I created a Connect instance 
    and attached a contact flow to the initial call greeting. This was integrated with the lambda that took a phone number 
    from the connect request and returned a spoken-friendly response of the top three results. 
    The top 5 results were saved into a DynamoDB table that was implemented with an index to get sorted results of most 
    recent 5 results for the web-app. The web-app was a simple S3 static website with Bootstrap, axios, moment, and vue.js to 
    create a simple table (link above). Data was retrieved through exposing a lambda function that queried DynamoDB through API Gateway. 
    
    ^Link near top of page
    