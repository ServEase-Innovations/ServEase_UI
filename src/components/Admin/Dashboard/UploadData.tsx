/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { Upload, FileText, Download, CheckCircle, AlertCircle, Clock } from "lucide-react";

const uploadHistory = [
  {
    id: 1,
    filename: "users_batch_01.csv",
    type: "Users",
    size: "2.3 MB",
    status: "Completed",
    records: 1247,
    date: "2024-01-15",
    errors: 0
  },
  {
    id: 2,
    filename: "service_providers.xlsx",
    type: "Providers",
    size: "1.8 MB", 
    status: "Completed",
    records: 324,
    date: "2024-01-14",
    errors: 5
  },
  {
    id: 3,
    filename: "pricing_update.json",
    type: "Pricing",
    size: "45 KB",
    status: "Processing", 
    records: 89,
    date: "2024-01-13",
    errors: 0
  },
  {
    id: 4,
    filename: "requests_export.csv",
    type: "Requests",
    size: "5.2 MB",
    status: "Failed",
    records: 0,
    date: "2024-01-12",
    errors: 12
  }
];

const UploadData = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Processing": return <Clock className="h-4 w-4 text-blue-600" />;
      case "Failed": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Processing": return "secondary";
      case "Failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Data</h1>
          <p className="text-muted-foreground">Import and manage bulk data uploads</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Drop files here or click to upload</h3>
              <p className="text-muted-foreground">Supports CSV, XLSX, JSON files up to 10MB</p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Templates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <p className="text-sm text-muted-foreground">Total Uploads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">1,189</div>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">35</div>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Supported Data Types */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Data Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "Users", description: "Customer and user data", icon: FileText },
              { type: "Service Providers", description: "Provider profiles and details", icon: FileText },
              { type: "Requests", description: "Service request records", icon: FileText },
              { type: "Pricing", description: "Service pricing and rates", icon: FileText }
            ].map((dataType) => (
              <div key={dataType.type} className="border border-border rounded-lg p-4 text-center space-y-2">
                <dataType.icon className="h-8 w-8 text-primary mx-auto" />
                <h4 className="font-medium">{dataType.type}</h4>
                <p className="text-sm text-muted-foreground">{dataType.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Filename</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Size</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Records</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Errors</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="border-b border-border">
                    <td className="p-4 font-medium">{upload.filename}</td>
                    <td className="p-4">
                      <Badge variant="outline">{upload.type}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{upload.size}</td>
                    <td className="p-4 text-muted-foreground">{upload.records.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(upload.status)}
                        <Badge variant={getStatusColor(upload.status)}>
                          {upload.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      {upload.errors > 0 ? (
                        <span className="text-red-600 font-medium">{upload.errors}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{upload.date}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {upload.errors > 0 && (
                          <Button variant="ghost" size="sm">
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadData;