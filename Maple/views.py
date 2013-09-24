# -*- coding: utf-8 -*-
from django.shortcuts import redirect, render, render_to_response
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseServerError
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from .models import  ChatNotis, ChatComments, UserChats, ChatTables

@login_required
def home(request):
    session = Session.objects.get(session_key = request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    ctx = Context({
        'user':user,
        'page_title':'Podium'
    })
    return render(request,'index.html', ctx)

@login_required
def pui(request):
    session = Session.objects.get(session_key = request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    ctx = Context({
        'user':user,
        'page_title':'PUI Framework'
    })
    return render(request,'pui.html', ctx)

@login_required
def people(request, people_id):
    session = Session.objects.get(session_key = request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    user_pageowner = User.objects.get(id = people_id)
    ctx = Context({
        'user':user,
        'user_pageowner':user_pageowner
    })
    return render(request,'profile.html',ctx)

@login_required
def chat(request):
    users = User.objects.select_related().all()[0:100]
    ctx = Context({
        'users':users
    })
    return render(request,'chat_index.html', ctx)

@login_required
def invite_chat(request):
    invite_people = request.GET.get("chatting_user", "")
    print "chating_user = " + invite_people
    session = Session.objects.get(session_key = request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    chatting_user = User.objects.get(id = invite_people)
    try:
        ChatTables.objects.get(from_chatting_user = user, to_chatting_user = chatting_user)
    except:
        try:
            ChatTables.objects.get(from_chatting_user = chatting_user, to_chatting_user = user)#양쪽으로 채팅중인 테이블이 있으면
        except:
            ChatNotis.objects.create(noti_from_user_key = user, noti_to_user_key = chatting_user)

    try: #이미 만들어져있는 채팅방이 있는지를 조회
        chat_info = UserChats.objects.get(chat_to_user_key = user, chat_from_user_key = chatting_user)
        chat_comments = ChatComments.objects.filter(userChat_key = chat_info)
        ctx = Context({
                        'user':user,
                        'chatting_user':chatting_user,
                        'chat_info':chat_info,
                        'chat_comments':chat_comments
        })
        return render_to_response('chat.html', ctx)
        #return HttpResponse(json.dumps(ctx), mimetype="application/json")
    except:
        try:
            chat_info = UserChats.objects.get(chat_to_user_key = chatting_user, chat_from_user_key = user)
            chat_comments = ChatComments.objects.filter(userChat_key = chat_info)
            ctx = Context({
                        'chat_info':chat_info,
                        'user':user,
                        'chatting_user':chatting_user,
                        'chat_comments':chat_comments
            })
            return render_to_response('chat.html', ctx)
        except:
            chat_info = UserChats.objects.create(chat_to_user_key = chatting_user, chat_from_user_key = user, chat_room_name = str(user.id) + "to" + str(chatting_user.id))
            chat_comments = ChatComments.objects.create(userChat_key = chat_info, chat_comment = "친구 초대")
            ctx = Context({
                        'user':user,
                        'chat_info':chat_info,
                        'chatting_user':chatting_user,
                        'chat_comments':chat_comments
            })
            return render_to_response('chat.html', ctx)

@login_required
def invited_chat(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    print "invited_chat event  " + user.username + " invite!"

    try:
        chat_noti = ChatNotis.objects.get(noti_to_user_key = user)#noti가 있으면 채팅 유저를 찾고
        chatting_user = User.objects.get(id = chat_noti.noti_from_user_key.id)
        try:
            ChatTables.objects.get(to_chatting_user = user, from_chatting_user = chatting_user)
        except:
            try:
                ChatTables.objects.get(to_chatting_user = chatting_user, from_chatting_user = user)
            except:
                ChatTables.objects.create(to_chatting_user = user, from_chatting_user = chatting_user)
                chat_noti.delete()

        try:
            chat_info = UserChats.objects.get(chat_to_user_key = user, chat_from_user_key = chatting_user)
        except:
            chat_info = UserChats.objects.get(chat_to_user_key = chatting_user, chat_from_user_key = user)

        chat_comments = ChatComments.objects.filter(userChat_key = chat_info)
        ctx = Context({
                        'user': user,
                        'chat_info': chat_info,
                        'chatting_user': chatting_user,
                        'chat_comments':chat_comments
        })
        return render_to_response('chat.html', ctx)
    except:
        return HttpResponse("0")

@csrf_exempt
def chat_comment(request): #chat_noti 만들어야 함
    if request.POST.get('type') == 'DELETE' :
        user_chat = UserChats.objects.get(chat_room_name = request.POST.get('room_name'))
        try:
            chat_table = ChatTables.objects.get(from_chatting_user = user_chat.chat_from_user_key, to_chatting_user = user_chat.chat_to_user_key)
        except:
            chat_table = ChatTables.objects.get(from_chatting_user = user_chat.chat_to_user_key, to_chatting_user = user_chat.chat_from_user_key)
        chat_table.delete()
        return HttpResponse("Everything worked :)")
    if request.POST.get('type') == "POST" :
        try:
            user_chat  = UserChats.objects.get(chat_room_name = request.POST.get('room_name'))
            print user_chat.chat_room_name
            user = User.objects.get(id = request.POST.get('user_id'))
            chat_comment = user.username + ": " + request.POST.get('comment')
            ChatComments.objects.create(userChat_key = user_chat, chat_comment = chat_comment)
            print request.POST.get('comment')
            return HttpResponse("Everything worked :)")
        except Exception, e:
            return HttpResponseServerError(str(e))
