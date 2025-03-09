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

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addLikes } from "@/db/mutation";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [selectedPost, setSelectedPost] = useState<string | undefined>();
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-destructive/10 p-4 rounded-lg text-destructive max-w-md">
          <p className="font-medium">Error loading posts</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // Calculate distance from current location (simplified version)
  const getDistance = (lat1: number, lon1: number) => {
    // This is just a placeholder for demonstration
    // In a real app, you'd calculate actual distance
    const distanceKm = Math.sqrt(
      Math.pow((lat1 - latitude) * 111, 2) +
        Math.pow(
          (lon1 - longitude) * 111 * Math.cos(latitude * (Math.PI / 180)),
          2
        )
    ).toFixed(1);
    return `${distanceKm}km`;
  };

  // Navigate through carousel
  const scrollToNextPost = () => {
    const container = document.getElementById("posts-carousel");
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const scrollToPrevPost = () => {
    const container = document.getElementById("posts-carousel");
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Format likes count
  const formatLikes = (likes: number, hates: number) => {
    const score = Number.isNaN(likes - hates) ? 0 : likes - hates;
    if (score > 999) return `${(score / 1000).toFixed(1)}k`;
    return score;
  };

  // Render mobile carousel view
  const renderMobileView = () => (
    <div className="h-screen relative flex flex-col">
      <div className="flex-grow relative">
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
        <CreatePostModal className="absolute right-4 top-4 z-10" />
      </div>

      <div className="bg-background py-3 px-2 border-t shadow-lg">
        <div className="flex items-center justify-between px-2 mb-3">
          <Badge variant="outline" className="font-normal">
            {value?.size} posts nearby
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={scrollToPrevPost}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={scrollToNextPost}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          id="posts-carousel"
          className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-hide p-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {value?.docs.map((post) => (
            <Card
              key={post.id}
              className={cn(
                "cursor-pointer transition-all snap-center flex-shrink-0 w-64 overflow-hidden border bg-card shadow-sm hover:shadow",
                selectedPost === post.id ? "ring-2 ring-primary shadow-md" : ""
              )}
              onClick={() => setSelectedPost(post.id)}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={post.data()?.author?.photoURL}
                        alt={post.data()?.author?.displayName}
                      />
                      <AvatarFallback>
                        {post?.data()?.author?.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium leading-none">
                      {post?.data()?.author?.displayName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="h-5 text-xs font-normal"
                  >
                    {getDistance(post.data().lat, post.data().long)}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium leading-none">
                    {post.data().title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {post.data().content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.promise(addLikes(post.id, "increament"), {
                          loading: "Liking...",
                          success: "Liked",
                          error: "Failed to like",
                        });
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs">
                      {formatLikes(post.data().likes, post.data().hates)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.promise(addLikes(post.id, "decreament"), {
                          loading: "Disliking...",
                          success: "Disliked",
                          error: "Failed to dislike",
                        });
                      }}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-20">
                      {post.data().lat.toFixed(4)}
                      <br />
                      {post.data().long.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Render desktop view with resizable panels
  const renderDesktopView = () => (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={25} className="h-screen">
        <div className="max-h-screen overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="font-normal">
              {value?.size} posts found near you
            </Badge>
            <CreatePostModal />
          </div>

          <div className="space-y-3">
            {value?.docs.map((post) => (
              <Card
                key={post.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow overflow-hidden",
                  selectedPost === post.id
                    ? "ring-2 ring-primary shadow-md"
                    : ""
                )}
                onClick={() => setSelectedPost(post.id)}
              >
                <div className="p-4 space-y-3">
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
                        <p className="text-sm font-medium leading-none">
                          {post?.data()?.author?.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {/* {post?.data()?.timestamp} */}
                          {getDistance(post.data().lat, post.data().long)} away
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      <span>
                        {post.data()?.lat.toFixed(4)},{" "}
                        {post.data()?.long.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium">
                      {post.data().title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {post.data().content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.promise(addLikes(post.id, "increament"), {
                            loading: "Liking...",
                            success: "Liked",
                            error: "Failed to like",
                          });
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span>
                        {formatLikes(post.data().likes, post.data().hates)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.promise(addLikes(post.id, "decreament"), {
                            loading: "Disliking...",
                            success: "Disliked",
                            error: "Failed to dislike",
                          });
                        }}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
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
  );

  return (
    <div className="relative">
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
};

export default DashboardPage;
