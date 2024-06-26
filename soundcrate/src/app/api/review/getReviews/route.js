import { connectMongoDB } from '@/lib/mongodb';
import Review from '@/lib/models/review';
import User from '@/lib/models/user';
import { NextResponse } from 'next/server';

export async function GET(req){
  try {
    await connectMongoDB();
    const search_params = Object.fromEntries(req.nextUrl.searchParams.entries());

    // initialize objects to filter/sort reviews
    let filter_query = {};
    let sort_query = {};
    let limit_query = Number.MAX_SAFE_INTEGER; // no limit
    
    // filter for specific song id
    if ('songId' in search_params) { filter_query.songId = search_params.songId };

    // filter for specific album id
    if ('albumId' in search_params) { filter_query.albumId = search_params.albumId };

    // filter by user id (priority) or username 
    if ('userId' in search_params) { 
      filter_query.user = search_params.userId 
    } else if ('username' in search_params) { 
      const user = await User.findOne({ username: search_params.username });
      
      if (!user) 
        return NextResponse.json(
          { message: `User with username ${search_params.username} does not exist` },
          { status: 400 }
        )
      
      filter_query.user = user._id;
    };
    
    // add in sort requirements specified in search params
    if ('sortBy' in search_params) { 
      if (search_params.sortBy == 'likes') {
        sort_query = { likesCount : -1 };
      } else if (search_params.sortBy == 'date') {
        sort_query = { createdAt : -1 };
      }
    };

    // // add in limit requirements specified in search params
    if ('limit' in search_params) { limit_query = parseInt(search_params.limit) };
    
    const reviews = await Review
      .aggregate([
        { // apply filters
          $match: { ...filter_query }
        },
        { // add likeCount field
          $addFields: {
            likesCount: { $size: '$likes' }
          }
        },
        { // apply sorting
          $sort: { ...sort_query }
        },
        { // apply limits
          $limit: limit_query
        },
        { // populate with user
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { 
          path: '$user',
        }
      },
      ])
      .exec();

    return NextResponse.json(
      { body: reviews }, 
      { status: 200 }
    )

  } catch (error) {
    return NextResponse.json(
      { message: `Internal Server Error: ${error}` },
      { status: 500 }
    )
  }
}