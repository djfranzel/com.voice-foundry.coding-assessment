# Cloud Foundry - Senior Developer Coding Assessment

#### Writing and Documentation:

1. Record your reasons for implementing the solution the way you did, struggles you faced and problems you overcame.

    Retrieving the best 5 vanity numbers was a challenge. I thought of a number of solutions for this, including 
    implementing a grammar API that phrases could be passed and good grammar comes back with some type of rating. 
    But, this might eliminate certain desirable results with duplicate words or with local grammatically-incorrect lingo. 
    I chose to set the word-pool to the top 5000 used english words, prioritized results toward the longest words,
    and created a popularity score of the phrase by getting the position in the most popular 5000 english words,
    which was sorted by most common to least common. Any one-word vanity numbers were automatically added.
    This heuristic produces memorable/popular, longer words that should be easier to remember.
    To improve these results, I'd be inclined to save all items to a DB and let a user parse through the results. 
    Most phone numbers didn't produce more than a few dozen results; some produced none. 
    
    I am familiar with AWS, so setting up the resources wasn't too much of a problem, but it took some googling to 
    implement the CloudFormation deployment solution. 

2. What shortcuts did you take that would be a bad practice in production?

    There should be some security around the exposed API which retrieves data from DynamoDB. It's currently open, but 
    would need to be behind authentication in production. I'd want to dive deeper into Amazon Connect since this was 
    my first time using this specific service. My solution works when calling the number, but there may be more architecture
    that would make this a more secure solution that I'm unaware of. There is not a great deal of automated testing, 
    but I did include several lambda tests in the `./test'` folder. Running these commands simulates a call request, 
    and results are stored in the DynamoDB table and a response.json file locally. I would come up with a more comprehensive
    deployment solution in production so that an engineer could easily deploy all the necessary code with just a few clicks.
    Most of the code - Lambda, DynamoDB table, roles, are deployed with Cloud Formation, but this solution could be more 
    comprehensive. 
   
3. What would you have done with more time? We know you have a life. :-)

    On the vanity number generation, we could also generate vanity numbers for the last four digits only. The top 5000 english word list
    was good, but we could consider other word sources, potentially expanding, and potentially removing some words.
    We could also test this more broadly, review with the client to create improvements, such as saving all 
    vanity numbers in a DB and having those available for a human to parse them. Some of the code could be refactored further,
    but I had a lot of fun with it, so it is fairly condensed given what it is doing. I'm sure that a client would have suggestions 
    and after a few iterations and conversations, we'd be able to add functionality to have a great product delivered. 
    
    I did not have time to implement the Custom Resource. I understand they are useful for automating a deployment  
    when Cloud Formation doesn't natively support the service. Instead, I created a `./deployment/contact-flow.json` export that contains 
    all the configuration for the contact flow, including a place for the lambda arn. An engineer can simply upload that .json into a contact flow, 
    and the full functionality is there. 

4. What other considerations would you make before making our toy app into something that would be ready for high volumes of traffic, potential attacks from bad folks, etc.

    There are probably some scaling and security considerations in Amazon Connect that I'm not currently aware of. I'd certainly
    implement security for the web-app viewer and API Gateway endpoint. I might set alarms and monitoring of all the resources being used, and
    tag them for consolidated billing insights. I'd want to dive deeper into Connect to learn of more security requirements,
    as I'm sure there could be more done than my bare-bones implementation. We could also build the web-app with a full 
    environment and load-balance requests across regions for minimizing latency. 

5. Please include an architecture diagram.

    The solution was implemented using AWS Connect, DynamoDB, Lambda, API Gateway, and S3. I created a Connect instance 
    and attached a contact flow to the initial call greeting. This was integrated with the lambda that took a phone number 
    from the connect request and returned a spoken-friendly response of the top three results. 
    The top 5 results were saved into a DynamoDB table that was implemented with an index to get sorted results of most 
    recent 5 results for the web-app. The web-app was a simple S3 static website with Bootstrap, axios, moment, and vue.js to 
    create a simple table. Data was retrieved through exposing a lambda function that queried DynamoDB through API Gateway. 
    Architecture diagram is linked below. 
<br>

##### Architecture diagram:
<a target="_blank" href="https://view-saved-vanity-numbers.s3.amazonaws.com/architecture-diagram.png">
https://view-saved-vanity-numbers.s3.amazonaws.com/architecture-diagram.png
</a>
    
##### Amazon Connect number:
`(312) 265-5426`

##### Dashboard displaying most recent 5 calls:
<a target="_blank" href="http://view-saved-vanity-numbers.s3-website-us-east-1.amazonaws.com/index.html">
http://view-saved-vanity-numbers.s3-website-us-east-1.amazonaws.com/index.html
</a>

##### Deployment:

Must have `aws-cli` v2 installed with configured credentials and node `v14.XX`. 

`./deployment/deploy.sh`
Replace variables at the top of the file with your own and run the script from the project root. This generates a .zip
of the lambda, uploads it to an S3 bucket, and then executes a CloudFormation template that creates the lambda, table, and
associated roles in a stack. 

A user will have to add the `./deployment/contact-flow.json` to their own Connect instance. The commands for associating 
the lambda function and adding the contact flow to the Connect instance are started. 

The web-app code exists in `./s3/` with an update script. A user can create an S3 bucket with static web hosting enabled, 
deploy the `./lambdas/view-saved-vanity-numbers` lambda, expose that lambda via API Gateway, add the endpoint in the `./s3/index.html`
and deploy. This could be fully automated as well. 

More could be done to fully automate this deployment with CloudFormation. It is possible with Custom Resources and
more time spent configuring the instance, but the main parts are there given the time. Let me know if you have any questions. 
