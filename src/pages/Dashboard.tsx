import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface FormData {
  articleTitle: string;
  titleAudience: string;
  seoKeywords: string;
  clientName: string;
  creativeBrief: string;
  articleType: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    articleTitle: '',
    titleAudience: '',
    seoKeywords: '',
    clientName: '',
    creativeBrief: '',
    articleType: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.articleTitle.trim()) newErrors.articleTitle = 'Article Title is required';
    if (!formData.titleAudience.trim()) newErrors.titleAudience = 'Title Audience is required';
    if (!formData.seoKeywords.trim()) newErrors.seoKeywords = 'SEO Keywords is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client Name is required';
    if (!formData.creativeBrief.trim()) newErrors.creativeBrief = 'Creative Brief is required';
    if (!formData.articleType) newErrors.articleType = 'Article Type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://seobrand.app.n8n.cloud/webhook/content-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleTitle: formData.articleTitle,
          titleAudience: formData.titleAudience,
          seoKeywords: formData.seoKeywords,
          articleType: formData.articleType,
          clientName: formData.clientName,
          creativeBrief: formData.creativeBrief,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Content request submitted successfully.",
        });
        
        // Reset form after successful submission
        setFormData({
          articleTitle: '',
          titleAudience: '',
          seoKeywords: '',
          clientName: '',
          creativeBrief: '',
          articleType: '',
        });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to SKYWIDE Dashboard
          </h1>
          <p className="text-muted-foreground">
            Hello {user?.email}, submit your content creation requests below.
          </p>
        </div>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Content Submission Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="articleTitle" className="text-foreground">
                    Article Title *
                  </Label>
                  <Input
                    id="articleTitle"
                    value={formData.articleTitle}
                    onChange={(e) => handleInputChange('articleTitle', e.target.value)}
                    className={`bg-background border-input ${errors.articleTitle ? 'border-destructive' : ''}`}
                    placeholder="Enter article title"
                  />
                  {errors.articleTitle && (
                    <p className="text-sm text-destructive">{errors.articleTitle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleAudience" className="text-foreground">
                    Title Audience *
                  </Label>
                  <Input
                    id="titleAudience"
                    value={formData.titleAudience}
                    onChange={(e) => handleInputChange('titleAudience', e.target.value)}
                    className={`bg-background border-input ${errors.titleAudience ? 'border-destructive' : ''}`}
                    placeholder="Enter target audience"
                  />
                  {errors.titleAudience && (
                    <p className="text-sm text-destructive">{errors.titleAudience}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoKeywords" className="text-foreground">
                    SEO Keywords *
                  </Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                    className={`bg-background border-input ${errors.seoKeywords ? 'border-destructive' : ''}`}
                    placeholder="Enter SEO keywords"
                  />
                  {errors.seoKeywords && (
                    <p className="text-sm text-destructive">{errors.seoKeywords}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-foreground">
                    Client Name *
                  </Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className={`bg-background border-input ${errors.clientName ? 'border-destructive' : ''}`}
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <p className="text-sm text-destructive">{errors.clientName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="articleType" className="text-foreground">
                    Article Type *
                  </Label>
                  <Select
                    value={formData.articleType}
                    onValueChange={(value) => handleInputChange('articleType', value)}
                  >
                    <SelectTrigger className={`bg-background border-input ${errors.articleType ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select article type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Blogs">Blogs</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.articleType && (
                    <p className="text-sm text-destructive">{errors.articleType}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creativeBrief" className="text-foreground">
                  Creative Brief *
                </Label>
                <Textarea
                  id="creativeBrief"
                  value={formData.creativeBrief}
                  onChange={(e) => handleInputChange('creativeBrief', e.target.value)}
                  className={`bg-background border-input min-h-[120px] ${errors.creativeBrief ? 'border-destructive' : ''}`}
                  placeholder="Enter detailed creative brief..."
                />
                {errors.creativeBrief && (
                  <p className="text-sm text-destructive">{errors.creativeBrief}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-glow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Content Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}