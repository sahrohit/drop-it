import Loader from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { getPostsByUID } from "@/db/query";
import { auth } from "@/firebase";
import { cn } from "@/lib/utils";
import { LucideUser2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

export const UserProfileModal = ({ className }: { className?: string }) => {
  const [user, loading] = useAuthState(auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [posts, postsLoading] = useCollection(getPostsByUID(user?.uid ?? ""), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  // Calculate user stats from posts
  const userStats = useMemo(() => {
    if (!posts || postsLoading) return null;

    const postDocs = posts.docs;
    const totalPosts = postDocs.length;

    // Track unique locations
    const uniqueLocations = new Set();

    // Calculate paila points
    let totalPailaPoints = 0;
    let totalLikes = 0;
    let totalHates = 0;

    postDocs.forEach((post) => {
      const data = post.data();

      // Add location to unique locations set
      const locationKey = `${data.lat}-${data.long}`;
      uniqueLocations.add(locationKey);

      // Calculate points for this post
      let postPoints = 0;

      // Points based on location importance (0-10 scale)
      const importanceFactor = data?.osm?.importance || 0;
      const importancePoints = importanceFactor * 1000; // Scale up for visibility

      // Points based on engagement (likes and hates)
      const engagementPoints = (data.likes || 0) * 5 - (data.hates || 0) * 2;

      // Track total likes and hates
      totalLikes += data.likes || 0;
      totalHates += data.hates || 0;

      // Anonymous posts get fewer points
      const anonymityFactor = data.anonymous ? 0.8 : 1;

      // Calculate total post points
      postPoints = (importancePoints + engagementPoints) * anonymityFactor;

      // Add to total paila points
      totalPailaPoints += Math.max(0, postPoints); // Ensure no negative points
    });

    return {
      totalPosts,
      uniqueLocations: uniqueLocations.size,
      pailaPoints: Math.round(totalPailaPoints),
      totalLikes,
      totalHates,
      engagementRate:
        totalPosts > 0
          ? ((totalLikes + totalHates) / totalPosts).toFixed(2)
          : 0,
    };
  }, [posts, postsLoading]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Credenza open={modalOpen} onOpenChange={setModalOpen}>
      <CredenzaTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 rounded-full", className)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? ""} alt="User" />
            <AvatarFallback>
              <LucideUser2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>User Profile</CredenzaTitle>
          <CredenzaDescription>
            {user?.displayName || "Anonymous User"}
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          {postsLoading ? (
            <Loader />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.photoURL ?? ""} alt="User" />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) ?? "AN"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <h3 className="text-2xl font-bold">
                    {userStats?.pailaPoints || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">Paila Points</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold">
                    {userStats?.totalPosts || 0}
                  </h4>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold">
                    {userStats?.uniqueLocations || 0}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Unique Locations
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold">
                    {userStats?.totalLikes || 0}
                  </h4>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h4 className="text-lg font-semibold">
                    {userStats?.totalHates || 0}
                  </h4>
                  <p className="text-sm text-muted-foreground">Total Hates</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Engagement Rate</h3>
                <div className="w-full bg-background rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        (Number(userStats?.engagementRate) || 0) * 20,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-right mt-1">
                  {userStats?.engagementRate || 0} per post
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">About Paila Points</h3>
                <p className="text-sm text-muted-foreground">
                  Paila points are calculated based on the importance of
                  locations you&apos;ve posted from, engagement on your posts,
                  and your activity across unique locations.
                </p>
              </div>
            </div>
          )}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};
