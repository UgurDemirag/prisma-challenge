# Take Home Challenge: Prisma Core Challenge

This repository contains the necessary codes for Prisma Core Challenge.

This service assumes that the input file is a valid and parsable CSV file and the service has enough disk and memory space. 

## Installation & Start

The setup is fairly simple. Just install the libraries with `npm i` command and build the code from source with `npm run build` command. All the libraries are version locked so there shouldn't be any problem with installation.

After completing the build, you can run the service with `npm run start`

## Testing

To test this service, install the libraries with `npm i` command. After the installation is complete, use `npm test` command. This will fire up the `jest` and run positive/negative tests.

## Constraints
- [x] CSV must be loaded into memory
- [x] 5 hours time
- [x] Data is readonly

The coding time really took 5 hours. The initial research time however took a lot more than that. I also asked about more details in a mail for clarification but didn't get a response.

# Q&A

### 1. What were some of the tradeoffs you made when building this and why were these acceptable tradeoffs?

_I sacrificed storage/memory space and startup time for query speed._

I didn't want to re-invent the databases. One of the assumptions I had is to optimize for the query speed output. That's why I decided to go with indexing all the columns and storing everything in a mix of Map/Array structure instead of using B-Tree.

The reason I had that assumption is because one of my constraints was about loading the data into memory instead of using any other way like streaming etc.

I tested the script with 3GB csv file and I know It's cliché, but _It works on my PC_

### 2. Given more time, what improvements or optimizations would you want to add? When would you add them?
   
I would start with a query optimization. A query analyzer would be a great addition if we were to add other data types/filters etc.

Another thing is to improve caching. Instead of using the current LRU, It's possible to implement partial caching where intermediate results from common filter operations are cached and reused.

Also addition of a debug mode for detailed performance data in console like `console.time` and more logging and monitoring would be great.

### 3. What changes are needed to accommodate changes to support other data types, multiple filters, or ordering of results?
_I willingly created a technical debt to make sure I could finish the project on time_

I decided to make only filter operations modular. Other parts could've been modular as well, like adding ordering and adding multiple filters but because of the time constraint, I decided not to. 

Adding new filter operations are easy. Some edits in `Filter.ts` file and `QueryEngine.ts` file are needed. Adding multiple filter and ordering however will require some time as I have to rewrite/extract functions.

### 4. What changes are needed to process extremely large datasets
_Even though memory is cheap, It's still finite._

Instead of dumping all the data into memory, for large datasets, I'd create a pipeline that would stream records from the disk and filter/project on the fly. Also, parallel processing would be added as well like reading partitioned data.

If we're talking about keeping the data strictly in memory, I'd choose changing the data structure for more suitable on the memory side like, dictionary encoding or as I've researched bit-packing and keeping bitmap indexes.

### 5. What do you still need to do to make this code production ready?
_Honestly, I'd just use SQLite or Redis depending on the requirements as they are way more improved and reliable._

However, for this specific project to be production ready, I'd need more details on the business rules and requirements to plan the next step as with the current constraints, it's impossible for me to see the direction this project will head to without knowing more. 

If we're talking about the shipping the current version to the production (select multiple columns with 1 filter that has 2 filtering operations), I'd say it needs better logging and a Query Explainer first. 
