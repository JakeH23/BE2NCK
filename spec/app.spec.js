process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const app = require('../app');
const request = require('supertest')(app);
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  it('GET - returns status 404 if the client enters an endpoint that does not exist', () => {
    request
      .get('/api/banana')
      .expect(404)
      .then((res) => {
        expect(res.body.message).to.equal('page not found');
      });
  });


  describe('/topics', () => {
    it('GET - returns status 200 and responds with an array of topic objects', () => request
      .get('/api/topics')
      .expect(200)
      .then((res) => {
        expect(res.body.topics).to.be.an('array');
        expect(res.body.topics[0]).to.have.all.keys('slug', 'description');
        expect(res.body.topics[0].slug).to.equal('mitch');
        expect(res.body.topics).to.have.length(2);
      }));
    it('POST - returns status 201 and accepts an object containing slug and description property, the slug must be unique and responds with the posted topic object', () => {
      const topic = { description: 'Code is love, code is life', slug: 'coding' };
      return request
        .post('/api/topics')
        .send(topic)
        .expect(201)
        .then((res) => {
          expect(res.body.topic.description).to.equal(topic.description);
          expect(res.body.topic.slug).to.equal(topic.slug);
        });
    });
    it('POST ERROR - returns status 400 if input provided is invalid', () => request
      .post('/api/topics')
      .send({ football: 'UP THE VILLA BOYS!' })
      .expect(400)
      .then((res) => {
        expect(res.body.message).to.equal('invalid input');
      }));
    it('ALL ERROR - returns status 405 if user tries to send a method that isnt get/post', () => request
      .delete('/api/topics')
      .expect(405)
      .then((res) => {
        expect(res.body.message).to.equal('this method is not allowed');
      }));
    it('POST ERROR - returns status 422 if user enters non-unique slug', () => {
      const topic = {
        description: 'everybody needs somebody to love',
        slug: 'mitch',
      };
      return request
        .post('/api/topics')
        .send(topic)
        .expect(422)
        .then((res) => {
          expect(res.body.message).to.equal('violates foreign key constraint');
        });
    });


    describe('/:topic/articles', () => {
      it('GET - returns status 200 and responds with an array of article objects for a given topic', () => request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then((res) => {
          expect(res.body.articles).to.have.length(10);
          expect(res.body.articles[0]).to.have.keys(
            'article_id',
            'title',
            'author',
            'votes',
            'created_at',
            'topic',
            'comment_count',
            'body',
          );
        }));
      it('GET - returns status 200 and abides by a limit query', () => request
        .get('/api/topics/mitch/articles?limit=1')
        .expect(200)
        .then((res) => {
          expect(res.body.articles).to.have.length(1);
        }));
      it('GET ERROR - returns status 400 if invalid syntax is used in the limit query', () => request
        .get('/api/topics/mitch/articles?limit=banana')
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.equal('invalid syntax for limit query');
        }));

      it('GET - returns status 200 and articles sorted by default of column created_at', () => request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
        }));
      it('GET - returns status 200 and articles sorted by chosen column', () => request
        .get('/api/topics/mitch/articles?sort_by=title')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Z');
        }));
      it('GET ERROR - returns status 200 and articles sorted by default of column created_at if invalid sort is given', () => request
        .get('/api/topics/mitch/articles?sort_by=banana')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
        }));
      it('GET - returns status 200 and articles sorted by default', () => request
        .get('/api/topics/mitch/articles')
        .expect(200).then((res) => {
          expect(res.body.articles[1].title).to.equal('Sony Vaio; or, The Laptop');
        }));
      it('GET - returns status 200 and articles sorted by default column and user chosen order of sort', () => request
        .get('/api/topics/mitch/articles?sort_ascending=true')
        .expect(200).then((res) => {
          expect(res.body.articles[0].title).to.equal('Moustache');
        }));
      it('GET ERROR- returns status 200 when given sort ascending query is given invalid syntax', () => request
        .get('/api/topics/mitch/articles?sort_ascending=banana')
        .expect(200).then((res) => {
          expect(res.body.articles[1].title).to.equal('Sony Vaio; or, The Laptop');
        }));
      it('GET - returns status 200 and articles sorted by chosen column and order of sort', () => request
        .get('/api/topics/mitch/articles?sort_by=title&sort_ascending=true')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('A');
        }));
      it('GET - returns status 200 and articles on a given page', () => request
        .get('/api/topics/mitch/articles?p=2')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Moustache');
        }));
      it('GET ERROR - returns status 400 if invalid syntax is used in the p query', () => request
        .get('/api/topics/mitch/articles?p=banana')
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.equal('invalid syntax for limit query');
        }));
      it('GET - returns status 200 and articles sorted by default column and default order of sort when given invalid sort value', () => request
        .get('/api/topics/mitch/articles?sort_ascending=banana')
        .expect(200).then((res) => {
          expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
        }));
      it('GET ERROR - returns status 404 if given non existant topic', () => request
        .get('/api/topics/banana/articles')
        .expect(404)
        .then((res) => {
          expect(res.body.message).to.equal('page not found');
        }));
      it('POST - returns status 201 and an object with the given parameters', () => {
        const postTest = {
          title: 'Heroes And Villians',
          body: "Let's get down to business to defeat the huns",
          created_by: '2',
        };
        return request
          .post('/api/topics/mitch/articles')
          .send(postTest)
          .expect(201)
          .then((res) => {
            expect(res.body.newArticle).to.haveOwnProperty('article_id');
            expect(res.body.newArticle.article_id).to.equal(13);
          });
      });
      it('POST ERROR - returns status 400 if the wrong fields are provided', () => {
        const postTest = {
          title: 'Heroes And Villians',
          created_by: '2',
          user_id: 'hello',
        };
        return request
          .post('/api/topics/mitch/articles')
          .send(postTest)
          .expect(400)
          .then((res) => {
            expect(res.body.message).to.equal('invalid input');
          });
      });
      it.only('POST ERROR - returns status 400 if topic parameter doesnt exist', () => {
        const postTest = {
          title: 'Heroes And Villians',
          body: "Let's get down to business to defeat the huns",
          created_by: '2',
        };
        return request
          .post('/api/topics/bats/articles')
          .send(postTest)
          .expect(400)
          .then((res) => {
            expect(res.body.message).to.equal('invalid input');
          });
      });
      it('ALL ERROR - returns status 405 if user tries to send a method that isnt get/post', () => request
        .delete('/api/topics/mitch/articles')
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.equal('this method is not allowed');
        }));
    });
  });


  describe('/articles', () => {
    it('GET - returns status 200 responds with an array of article objects', () => request
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        expect(res.body.articles).to.be.an('array');
        expect(res.body.articles[0]).to.have.all.keys(
          'author',
          'article_id',
          'title',
          'votes',
          'topic',
          'comment_count',
          'created_at',
        );
        expect(res.body.articles[0].topic).to.equal('mitch');
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
        expect(res.body.articles).to.have.length(10);
      }));
    it('GET - returns status 200 and abides by a limit query', () => request
      .get('/api/articles?limit=1')
      .expect(200).then((res) => {
        expect(res.body.articles).to.have.length(1);
      }));
    it('GET ERROR - returns status 400 if invalid syntax is used in the limit query', () => request
      .get('/api/articles?limit=banana')
      .expect(400)
      .then((res) => {
        expect(res.body.message).to.equal('invalid syntax for limit query');
      }));
    it('GET - returns status 200 and articles sorted by default of column created_at', () => request
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET - returns status 200 and articles sorted by chosen column', () => request
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Z');
      }));
    it('GET ERROR - returns status 200 and articles sorted by default of column created_at if invalid sort is given', () => request
      .get('/api/articles?sort_by=banana')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET - returns status 200 and articles sorted by default column and user chosen order of sort', () => request
      .get('/api/articles?sort_ascending=true')
      .expect(200).then((res) => {
        expect(res.body.articles[0].title).to.equal('Moustache');
      }));
    it('GET ERROR- returns status 200 when given sort ascending query is given invalid syntax', () => request
      .get('/api/articles?sort_ascending=banana')
      .expect(200).then((res) => {
        expect(res.body.articles[1].title).to.equal('Sony Vaio; or, The Laptop');
      }));
    it('GET - returns status 200 and articles sorted by chosen column and order of sort', () => request
      .get('/api/articles?sort_by=title&sort_ascending=true')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('A');
      }));
    it('GET - returns status 200 and articles on a given page', () => request
      .get('/api/articles?p=2')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Am I a cat?');
      }));
    it('GET ERROR - returns status 400 if invalid syntax is used in the p query', () => request
      .get('/api/articles?p=banana')
      .expect(400)
      .then((res) => {
        expect(res.body.message).to.equal('invalid syntax for limit query');
      }));
    it('GET - returns status 200 and articles sorted by default column and default order of sort when given invalid sort value', () => request
      .get('/api/articles?sort_ascending=banana')
      .expect(200).then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));

    it('ALL ERROR - returns status 405 if user tries to send a method that isnt get', () => request
      .delete('/api/articles')
      .expect(405)
      .then((res) => {
        expect(res.body.message).to.equal('this method is not allowed');
      }));
    it('ALL ERROR - returns status 405 if user tries to send a method that isnt get', () => request
      .post('/api/articles')
      .send({ name: 'hello' })
      .expect(405)
      .then((res) => {
        expect(res.body.message).to.equal('this method is not allowed');
      }));


    describe('/articles/:article_id', () => {
      it('GET - returns status 200 responds with an array of article objects', () => request
        .get('/api/articles/3')
        .expect(200)
        .then((res) => {
          expect(res.body.articles).to.be.an('array');
          expect(res.body.articles[0]).to.have.all.keys(
            'author',
            'article_id',
            'title',
            'votes',
            'topic',
            'comment_count',
            'created_at',
            'body',
          );
          expect(res.body.articles[0].topic).to.equal('mitch');
          expect(res.body.articles[0].body).to.equal('some gifs');
          expect(res.body.articles).to.have.length(1);
        }));
      it('GET ERROR - returns status 404 if given non existant article', () => request
        .get('/api/articles/48964')
        .expect(404)
        .then((res) => {
          expect(res.body.message).to.equal('page not found');
        }));
      it('GET ERROR - returns status 400 if paramater given has invalid syntax', () => request
        .get('/api/articles/hello')
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.equal('invalid input syntax for integer');
        }));
      it('PATCH - returns status 202 and take an object and positively increases votes if postive integer given', () => {
        request
          .patch('/api/articles/1')
          .send({ inc_votes: 5 })
          .expect(200)
          .then((res) => {
            expect(res.body.voteUpdate[0].title).to.equal('Living in the shadow of a great man');
            expect(res.body.voteUpdate[0].votes).to.equal(105);
          });
      });
      it('PATCH - returns status 202 and takes an object and negatively increases votes if negative integer given', () => {
        request
          .patch('/api/articles/1')
          .send({ inc_votes: -25 })
          .expect(200)
          .then((res) => {
            expect(res.body.voteUpdate[0].title).to.equal('Living in the shadow of a great man');
            expect(res.body.voteUpdate[0].votes).to.equal(75);
          });
      });
      it('DELETE - returns status 202 and removes given article by its id', () => request
        .delete('/api/articles/1')
        .expect(204)
        .then((res) => {
          expect(res.body).to.eql({});
        }));
      it('ALL ERROR - returns status 405 if user tries to send a method that isnt get/patch/delete', () => request
        .post('/api/articles/1')
        .send({ name: 'hello' })
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.equal('this method is not allowed');
        }));
    });


    describe('/articles/:article_id/comments', () => {
      it('GET - returns status 200 responds with an array of comment objects', () => request
        .get('/api/articles/1/comments')
        .expect(200)
        .then((res) => {
          expect(res.body.comments).to.be.an('array');
          expect(res.body.comments[0]).to.have.all.keys(
            'comment_id',
            'author',
            'votes',
            'created_at',
            'body',
          );
          expect(res.body.comments[0].author).to.equal('butter_bridge');
          expect(res.body.comments[0].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
          expect(res.body.comments).to.have.length(10);
        }));
      it('GET - returns status 200 and abides by a limit query', () => request
        .get('/api/articles/1/comments?limit=5')
        .expect(200).then((res) => {
          expect(res.body.comments).to.have.length(5);
        }));
      it('GET ERROR - returns status 400 if invalid syntax is used in the limit query', () => request
        .get('/api/articles/1/comments?limit=banana')
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.equal('invalid syntax for limit query');
        }));
      it('GET - returns status 200 and comments sorted by default of column created_at', () => request
        .get('/api/articles/1/comments')
        .expect(200)
        .then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(2);
        }));
      it('GET - returns status 200 and comments sorted by chosen column', () => request
        .get('/api/articles/1/comments?sort_by=comment_id')
        .expect(200)
        .then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(18);
        }));
      it('GET ERROR - returns status 200 and comments sorted by default of column created_at if invalid sort is given', () => request
        .get('/api/articles/1/comments?sort_by=banana')
        .expect(200)
        .then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(2);
        }));
      it('GET - returns status 200 and comments sorted by default column and user chosen order of sort', () => request
        .get('/api/articles/1/comments?sort_ascending=true')
        .expect(200).then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(18);
        }));
      it('GET ERROR- returns status 200 and return comments descending when sort ascending query is given invalid syntax', () => request
        .get('/api/articles/1/comments?sort_ascending=banana')
        .expect(200).then((res) => {
          expect(res.body.comments[1].comment_id).to.equal(3);
        }));
      it('GET - returns status 200 and comments sorted by chosen column and order of sort', () => request
        .get('/api/articles/1/comments?sort_by=comment_id&sort_ascending=true')
        .expect(200)
        .then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(2);
        }));
      it('GET - returns status 200 and comments on a given page', () => request
        .get('/api/articles/1/comments?p=2')
        .expect(200)
        .then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(12);
        }));
      it('GET ERROR - returns status 400 if invalid syntax is used in the p query', () => request
        .get('/api/articles/1/comments?p=banana')
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.equal('invalid syntax for limit query');
        }));
      it('GET - returns status 200 and articles sorted by default column and default order of sort when given invalid sort value', () => request
        .get('/api/articles/1/comments?sort_ascending=banana')
        .expect(200)
        .then((res) => {
          expect(res.body.comments[0].comment_id).to.equal(2);
        }));
      it('POST - returns status 201 and an object with the posted parameter', () => {
        const postTest = {
          user_id: 1,
          body: "Let's get down to business to defeat the huns",
        };
        return request
          .post('/api/articles/1/comments')
          .send(postTest)
          .expect(201)
          .then((res) => {
            expect(res.body.comment).to.haveOwnProperty('comment_id');
            expect(res.body.comment.comment_id).to.equal(19);
          });
      });
      it('POST ERROR - returns status 400 if the incorrect parameters are provided', () => {
        const postTest = {
          hello: 'hello',
          body: "Let's get down to business to defeat the huns",
        };
        return request
          .post('/api/articles/1/comments')
          .send(postTest)
          .expect(400)
          .then((res) => {
            expect(res.body.message).to.equal('invalid input');
          });
      });
      it('POST ERROR - returns status 422 if article parameter doesnt exist', () => {
        const postTest = {
          user_id: 1,
          body: "Let's get down to business to defeat the huns",
        };
        return request
          .post('/api/articles/5242/comments')
          .send(postTest)
          .expect(422)
          .then((res) => {
            expect(res.body.message).to.equal('the value inserted in foreign key is invalid');
          });
      });
      it('ALL ERROR - returns status 405 if user tries to send a method that isnt get/post', () => request
        .delete('/api/articles/1/comments')
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.equal('this method is not allowed');
        }));

      describe('/articles/:article_id/comments/:comment_id', () => {
        it('PATCH - returns status 202 and take an object and positively increases votes if postive integer given', () => request
          .patch('/api/articles/1/comments/2')
          .send({ inc_votes: 5 })
          .expect(200)
          .then((res) => {
            expect(res.body.voteUpdate[0].comment_id).to.equal(2);
            expect(res.body.voteUpdate[0].votes).to.equal(19);
          }));
        it('PATCH - returns status 202 and takes an object and negatively increases votes if negative integer given', () => request
          .patch('/api/articles/1/comments/2')
          .send({ inc_votes: -9 })
          .expect(200)
          .then((res) => {
            expect(res.body.voteUpdate[0].comment_id).to.equal(2);
            expect(res.body.voteUpdate[0].votes).to.equal(5);
          }));
        it('DELETE - returns status 204 and returns and empty object', () => request
          .delete('/api/articles/1/comments/2')
          .expect(204)
          .then((res) => {
            expect(res.body).to.eql({});
          }));
        it('ALL ERROR - returns status 405 if user tries to send a method that isnt patch/delete', () => request
          .post('/api/articles/1/comments/2')
          .send({ name: 'hello' })
          .expect(405)
          .then((res) => {
            expect(res.body.message).to.equal('this method is not allowed');
          }));
      });
    });
  });

  describe('/users', () => {
    it('GET - returns status 200 responds with an array of user objects', () => request
      .get('/api/users')
      .expect(200)
      .then((res) => {
        expect(res.body.users).to.be.an('array');
        expect(res.body.users[0]).to.have.all.keys(
          'user_id',
          'username',
          'avatar_url',
          'name',
        );
        expect(res.body.users[1].username).to.equal('icellusedkars');
        expect(res.body.users[2].name).to.equal('paul');
        expect(res.body.users).to.have.length(3);
      }));
    it('ALL ERROR - returns status 405 if user tries to send a method that isnt get', () => request
      .post('/api/users')
      .send({ name: 'hello' })
      .expect(405)
      .then((res) => {
        expect(res.body.message).to.equal('this method is not allowed');
      }));
    it('ALL ERROR - returns status 405 if user tries to send a method that isnt get', () => request
      .delete('/api/users')
      .expect(405)
      .then((res) => {
        expect(res.body.message).to.equal('this method is not allowed');
      }));

    describe('/users/user:id', () => {
      it('GET - returns status 200 responds with an array of user objects', () => request
        .get('/api/users/3')
        .expect(200)
        .then((res) => {
          expect(res.body.user).to.have.all.keys(
            'user_id',
            'username',
            'avatar_url',
            'name',
          );
          expect(res.body.user.username).to.equal('rogersop');
          expect(res.body.user.name).to.equal('paul');
        }));
      it('GET ERROR - returns status 404 if given non existant user_id', () => request
        .get('/api/users/48964')
        .expect(404)
        .then((res) => {
          expect(res.text.message).to.equal('page not found');
        }));
      it('GET ERROR - returns status 400 if param given in wrong syntax', () => request
        .get('/api/users/hello')
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.equal('invalid input syntax for integer');
        }));
      it('ALL ERROR - returns status 405 if user tries to send a method that isnt get', () => request
        .post('/api/users/1')
        .send({ name: 'hello' })
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.equal('this method is not allowed');
        }));
      it('ALL ERROR - returns status 405 if user tries to send a method that isnt get', () => request
        .delete('/api/users/1')
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.equal('this method is not allowed');
        }));
    });
  });
});
