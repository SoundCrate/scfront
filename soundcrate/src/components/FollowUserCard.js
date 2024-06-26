'use client';

import { FollowBtn } from '@/components';
import Link from 'next/link';

export default function FollowUserCard({ 
  username,
  user_id,
  profile_img=null,
  review_count=0,
  user_is_following
 }) {
  const profile_url = `/user/${username}/profile`

  return (
    <div>
        <div className="max-h-fit flex flex-row justify-between items-center">
          
          {/* 1 - profile img, username, watch details */}
          <div className="flex items-start gap-3">


            {/* 1.2 - profile img */}
            <img
              src={profile_img ?? "/images/default-user.png"} 
              alt={username}
              className="rounded-md object-cover w-[45px] h-[45px]"
              onError={e => {
                e.currentTarget.src = "/images/default-user.png"
            }}
            />

            <div className="flex flex-col">
            
              {/* username */}
              <Link href={profile_url}>
                <h4>{username}</h4>
              </Link>

              {/* review_count */}
              <div className="flex gap-2 opacity-60 uppercase text-xs">
                <Link href={profile_url+"/reviews"}>{review_count} Reviews</Link> 
              </div>
            </div>

          </div>
          
          {user_is_following &&
            <FollowBtn 
              userId={user_id} 
              user_is_following={user_is_following} 
            />
          }

        </div>
    </div>
  );
}
