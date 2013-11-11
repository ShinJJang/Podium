from haystack import indexes
from django.contrib.auth.models import User
from .models import Posts, Groups


class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    post = indexes.CharField(model_attr='post')

    def get_model(self):
        return Posts

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()


class UserIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    username = indexes.EdgeNgramField(model_attr='username')
    email = indexes.CharField(model_attr='email')

    def get_model(self):
        return User

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()


class GroupIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    group_name = indexes.EdgeNgramField(model_attr='group_name')
    description = indexes.EdgeNgramField(model_attr='description')

    def get_model(self):
        return Groups

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all().exclude(open_scope=2)