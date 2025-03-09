"use client";

import { getPosts } from "@/db/query";
import { useCollection } from "react-firebase-hooks/firestore";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CreatePostModal } from "@/components/partials/post/modal";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addLikes } from "@/db/mutation";
import { toast } from "sonner";

const DashboardPage = () => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [selectedPost, setSelectedPost] = useState<string | undefined>();

  const [value, loading, error] = useCollection(getPosts(latitude, longitude), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  console.log("Latitude", latitude);
  console.log("Longitude", longitude);

  return (
    <div className="relative">
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel defaultSize={20} className="h-screen">
          <div className="lg:col-span-1 max-h-screen overflow-y-auto pr-2">
            <p>({value?.size} posts found)</p>

            {value?.docs.map((post) => (
              <Card
                key={post.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md m-4 gap-3",
                  selectedPost === post.id ? "ring-2 ring-primary" : ""
                )}
                onClick={() => setSelectedPost(post.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={post.data()?.author?.photoURL}
                          alt={post.data()?.author?.displayName}
                        />
                        <AvatarFallback>
                          {post?.data()?.author?.displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {post?.data()?.author?.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {/* {post?.data()?.timestamp} */}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {post.data()?.lat}, {post.data()?.long}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg">Title Goes Here</CardTitle>
                  <CardDescription className="line-clamp-3 mt-1">
                    {post.data().content}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0 flex items-center gap-4 text-sm text-muted-foreground">
                  <Button
                    onClick={() => {
                      toast.promise(addLikes(post.id, "increament"), {
                        loading: "Liking...",
                        success: "Liked",
                        error: "Failed to like",
                      });
                    }}
                    variant="ghost"
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <span>
                    {Number.isNaN(post.data().likes - post.data().hates)
                      ? 0
                      : post.data().likes - post.data().hates}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      toast.promise(addLikes(post.id, "decreament"), {
                        loading: "Disliking...",
                        success: "Disliked",
                        error: "Failed to dislike",
                      });
                    }}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <CreatePostModal className="absolute right-8 top-8 z-10" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <Map
            lat={
              value?.docs.find((x) => x.id === selectedPost)?.data().lat ??
              latitude
            }
            long={
              value?.docs.find((x) => x.id === selectedPost)?.data().long ??
              longitude
            }
            all={
              value?.docs.map((x) => ({
                lat: x.data().lat,
                long: x.data().long,
                content: x.data().content,
              })) ?? []
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DashboardPage;
