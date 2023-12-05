const { ApolloServer } = require('apollo-server-express');
const { buildSchema } = require('type-graphql');
const { PostResolver } = require('../src/resolvers/post');
const { UserResolver } = require('../src/resolvers/user');
const { CommentResolver } = require('../src/resolvers/comment');
const { HelloResolver } = require('../src/resolvers/hello');

describe('Server Start Test', () => {
  it('should start Apollo Server without errors', async () => {
    expect.assertions(1);
    
    try {
      const schema = await buildSchema({
        resolvers: [HelloResolver, PostResolver, UserResolver, CommentResolver],
      });

      new ApolloServer({ schema }); // Initialize Apollo Server
      
      expect(true).toBe(true); // If no error is thrown, the test passes
    } catch (error) {
      expect(error).toBeUndefined(); // Fail the test if any error is thrown
    }
  });
});
