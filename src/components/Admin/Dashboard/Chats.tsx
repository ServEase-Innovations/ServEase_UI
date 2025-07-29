/* eslint-disable */
import { Search, MessageSquare, Send } from "lucide-react";
import { Badge } from "src/components/Common/Badge";
import { Button } from "src/components/Common/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/Common/Card";
import { Input } from "src/components/Common/input";

const chats = [
  { 
    id: 1, 
    customer: "John Smith", 
    provider: "Clean Masters", 
    lastMessage: "When can you start the cleaning?", 
    timestamp: "2 min ago", 
    status: "Active",
    unread: 2
  },
  { 
    id: 2, 
    customer: "Sarah Johnson", 
    provider: "Fix It Pro", 
    lastMessage: "Thank you for the quick service!", 
    timestamp: "1 hour ago", 
    status: "Resolved",
    unread: 0
  },
  { 
    id: 3, 
    customer: "Mike Wilson", 
    provider: "Garden Experts", 
    lastMessage: "Can you provide a quote for weekly maintenance?", 
    timestamp: "3 hours ago", 
    status: "Active",
    unread: 1
  },
  { 
    id: 4, 
    customer: "Emily Davis", 
    provider: "Electric Solutions", 
    lastMessage: "The installation is complete", 
    timestamp: "1 day ago", 
    status: "Resolved",
    unread: 0
  },
];

const Chats = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chats</h1>
          <p className="text-muted-foreground">Monitor customer and provider communications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">248</div>
            <p className="text-sm text-muted-foreground">Total Conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">89</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <p className="text-sm text-muted-foreground">Unread Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">94%</div>
            <p className="text-sm text-muted-foreground">Response Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search chats..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className="p-4 border-b border-border hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{chat.customer}</span>
                        <span className="text-xs text-muted-foreground">↔</span>
                        <span className="text-sm text-muted-foreground">{chat.provider}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chat.timestamp}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={chat.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {chat.status}
                      </Badge>
                      {chat.unread > 0 && (
                        <div className="bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>John Smith ↔ Clean Masters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-96 overflow-y-auto mb-4">
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hi, I need a house cleaning service for this weekend.</p>
                  <p className="text-xs text-muted-foreground mt-1">John • 10:30 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hello! We'd be happy to help. What's the size of your home?</p>
                  <p className="text-xs opacity-75 mt-1">Clean Masters • 10:35 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-xs">
                  <p className="text-sm">It's a 3-bedroom house, about 1,500 sq ft.</p>
                  <p className="text-xs text-muted-foreground mt-1">John • 10:36 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Perfect! When can you start the cleaning?</p>
                  <p className="text-xs opacity-75 mt-1">Clean Masters • 10:40 AM</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chats;