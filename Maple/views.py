# -*- coding: utf-8 -*-
from django.views.generic.edit import CreateView

from .models import UserProfile, Post
from .forms import PostForm, PostWriteForm
from django.utils import timezone

class WritePost(CreateView):
    model = PostForm
    form_class = PostWriteForm
    success_url = '/'
    template_name = 'index.html'

    def form_valid(self, form):
        user = self.request.user.id
        instance = form.save(commit=False)
        instance.created = timezone.now()
        instance.user_key = UserProfile.objects.get(user_id=user)
        return super(WritePost, self).form_valid(form)

#class UpdatePost(UpdateView):