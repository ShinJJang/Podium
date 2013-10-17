from haystack import indexes

from django.utils import timezone

from .models import *

class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    post = indexes.CharField(model_attr='post')

    def get_model(self):
        return Posts

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()