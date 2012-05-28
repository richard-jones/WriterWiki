// click handlers

function snapshotClick(event, element) {
    var body = $("textarea")[0].value
    var page = $(element).attr("data-page")
    var obj = { content : body, commit : true }
    $.post('/page/' + page, obj, function() { updateDateDisplay($("#last_snapshot")) })
}

function templateInsertClick(even, element){
    var name = $('#template')[0].value
    $.get('/template/' + name + ".txt", function(t){
        $("textarea")[0].value += t
    })
}

function worksLinkClick(event, element) {
    event.preventDefault()
    
    $.get('/api/works', function(t) {
        var j = eval('(' + t + ')')
        j = workLink(j)
        
        frag = '<a href="#" id="newwork" >[Add New Work]</a><br>'
        popup("works", "Work", j, frag)
        
        $(".linkwork").click(function(event) {
            event.preventDefault()
            var work = $(this).attr("data-work")
            $.get($(this).attr("href"), function(t) {
                var j = eval('(' + t + ')')
                j = accessLink(j)
                popupPopup("workpages", "Pages in <em>" + work + "</em>", j, "works")
            });
        });
        
        $("#newwork").click(function(event) {
            event.preventDefault();
            newWorkForm("works")
        });
    });
}

function newWorkForm(parent_id)
{
    frag = '<div id="newworkform"> \
            <strong>Create new work</strong><br> \
        <form id="createnewworkform"> \
            Name: <input type="text" name="work_name"><br>\
            Description: \
            <textarea name="work_description"></textarea><br> \
            <input id="createnewwork" type="submit" name="submit" value="Create"> \
        </form> \
    </div>'
    $('body').append(frag)
    centerPopup("#newworkform");
    $("#newworkform").fadeIn("fast")
    
    $('#backplate').unbind("click");
    $('#backplate').click(function () {
        $("#newworkform").fadeOut("fast").detach()
        $("#backplate").unbind("click")
        $('#backplate').click(function () {
            $("#" + parent_id).fadeOut("fast").detach()
            $("#backplate").css("display", "none").unbind("click")
        })
    })
    
    $("#createnewwork").click(function(event) {
        event.preventDefault()
        var page = $('body').attr('data-page');
        var name = $('#createnewworkform input[name="work_name"]')[0].value;
        var desc = $('#createnewworkform textarea')[0].value;
        var obj = { "name" : name, "description" : desc }
        $.post('/api/works', obj, function(t) {
            var o = { "page" :  page }
            $.post('/api/work/' + name, o, function(t) {
                pageWorks(page)
                $('#' + parent_id).fadeOut("fast").detach()
                $("#newworkform").fadeOut("fast").detach()
                $("#backplate").css("display", "none").unbind("click")
            });
        });
    });
}

function worksButtonClick(event, element) {
    event.preventDefault()
    
    var page = $(element).attr('data-page')
    $.get('/api/works', function(t) {
        var j = eval('(' + t + ')')
        j = addToWorkLink(j)
        
        frag = '<a href="#" id="newwork" >[Add New Work]</a><br>'
        popup("works", "Work", j, frag)
        
        $(".addtowork").click(function(event) {
            event.preventDefault()
            var work = $(this).attr("data-work")
            var obj = { "page" :  page }
            $.post($(this).attr("href"), obj, function(t) {
                $("#works").fadeOut("fast").detach()
                $("#backplate").css("display", "none").unbind("click")
            });
        });
        
        $("#newwork").click(function(event) {
            event.preventDefault();
            newWorkForm("works")
        });
    });
}

// ?
function addPageToWork(page, work, callback)
{
    var obj = { "page" :  page }
    $.post('/api/work/' + work, obj, function(t) {
        $("#works").fadeOut("fast").detach()
        $("#backplate").css("display", "none").unbind("click")
    });
}

function allPageClick(event, element) {
    event.preventDefault()
    
    $.get('/api/pages', function(t) {
        var j = eval('(' + t + ')')
        j = accessLink(j)
        popup("allpages", "All Pages", j)
    }) 
}

function workingSetClick(event, element){
    event.preventDefault()
    
    $.get('/api/working', function(t) {
        var j = eval('(' + t + ')')
        j = accessRemoveLink(j, '/api/working', "x")
        
        popup("workingset", "Current Working Set", j)
        
        $(".removelink").click(function(event) {
            event.preventDefault()
            
            var page = $(element).attr("data-page")
            $.ajax('/api/working/' + page, {"type" : "DELETE"}).success(function () {
                $("#working_" + page).css("text-decoration", "line-through")
                $("#working_" + page + " a[class='removelink']").detach()
                addToWorkingSetButton(page)
            })
        });
    })
}

function tagsLinkClick(event, element){
    event.preventDefault()
    
    $.get('/api/tags', function(t) {
        var j = eval('(' + t + ')')
        j = tagLink(j)
        popup("tagcloud", "Tags", j)
        
        $(".linktag").click(function(event) {
            event.preventDefault()
            
            tag = $(this).attr('data-tag')
            $.get($(this).attr("href"), function(t) {
                var j = eval('(' + t + ')')
                j = accessLink(j)
                popupPopup("taggedpages", "Pages tagged with <em>" + tag + "</em>", j, "tagcloud")
            });
        });
    });
}

// layout methods

function popup(id, title, list, prepend)
{
    if (prepend == undefined)
    {
        prepend = ""
    }
    var frag = columnLayout(id, 4, list, title, prepend)
    $('body').append(frag)
    centerPopup("#" + id);
    $("#" + id).fadeIn("fast")
    $('#backplate').click(function () {
        $("#" + id).fadeOut("fast").detach()
        $("#backplate").css("display", "none").unbind("click")
    })
    $("#backplate").css("display", "block")
}

function popupPopup(id, title, list, parent_id)
{
    var frag = columnLayout(id, 4, list, title)
    $('body').append(frag)
    centerPopup("#" + id);
    $("#" + id).fadeIn("fast");
    $('#backplate').unbind("click");
    $('#backplate').click(function () {
        $("#" + id).fadeOut("fast").detach()
        $("#backplate").unbind("click")
        $('#backplate').click(function () {
            $("#" + parent_id).fadeOut("fast").detach()
            $("#backplate").css("display", "none").unbind("click")
        })
    })
}

function centerPopup(popup) {  
    //request data for centering  
    var windowWidth = document.documentElement.clientWidth;  
    var windowHeight = document.documentElement.clientHeight;  
    var popupHeight = $(popup).height();  
    var popupWidth = $(popup).width();  
    
    //centering  
    $(popup).css({  
        "position": "absolute",  
        "top": windowHeight/2-popupHeight/2,  
        "left": windowWidth/2-popupWidth/2  
    });
}

function columnLayout(id, n, pages, title, prepend) {
    frag = '<div id="' + id + '"> \
            <strong>' + title + '</strong><br> \
            ' + prepend + ' \
            <table> \
                <tr> \
                    <td>'
    
    var l = pages.length
    for (var i = 0; i < pages.length; i++)
    {
        frag += pages[i] + '<br>'
        
        if (i % Math.ceil(l / n) === 0)
        {
            frag += '</td><td>'
        }
    }
    
    frag += '           </td> \
                    </tr> \
                </table> \
            </div>'
    return frag
}

function accessRemoveLink(pages, path, st) {
    n = []
    for (var i = 0; i < pages.length; i++)
    {
        n.push('<span id="working_' + pages[i] + '"><a href="/page/' + pages[i] + '">' + pages[i] + '</a>' + 
                '<a data-page="' + pages[i] + '" class="removelink" href="' + 
                path + '/' + pages[i] + '">' + st + '</a></span>')
    }
    return n
}

function accessLink(pages) {
    n = []
    for (var i = 0; i < pages.length; i++)
    {
        n.push('<a href="/page/' + pages[i] + '">' + pages[i] + '</a>')
    }
    return n
}

function tagLink(tags) {
    n = []
    for (var i = 0; i < tags.length; i++)
    {
        n.push('<a class="linktag" data-tag="' + tags[i] + '" href="/api/tag/' + tags[i] + '">' + tags[i] + '</a>')
    }
    return n
}

function workLink(works) {
    n = []
    for (var i = 0; i < works.length; i++)
    {
        n.push('<a class="linkwork" data-work="' + works[i] + '" href="/api/work/' + works[i] + '">' + works[i] + '</a>')
    }
    return n
}

function addToWorkLink(works) {
    n = []
    for (var i = 0; i < works.length; i++)
    {
        n.push('<a class="addtowork" data-work="' + works[i] + '" href="/api/work/' + works[i] + '">' + works[i] + '</a>')
    }
    return n
}

// page level operational functions

function periodicSave(page_name)
{
    var body = $("textarea")[0].value
    doSave(page_name, body)
    // save every 20 seconds
    updateDateDisplay($("#last_saved"))
    var t = setTimeout("periodicSave('" + page_name + "')", 20000);
}

function doSave(name, body)
{
    var obj = { content : body }
    $.post('/page/' + name, obj)
}

function updateDateDisplay(element)
{
    var date = new Date()
    var month = ('0' + (date.getMonth() + 1)).substr(-2,2)
    var day = ('0' + date.getDate()).substr(-2,2)
    var year = date.getFullYear()
    var hours = ('0' + date.getHours()).substr(-2,2)
    var minutes = ('0' + date.getMinutes()).substr(-2,2)
    var seconds = ('0' + date.getSeconds()).substr(-2,2)
    element.html(hours + ":" + minutes + ":" + seconds + " on " + day + "-" + month + "-" + year)
}

function workingSetButton(page)
{
    $.get('/api/working', function(t) {
        var j = eval("(" + t + ")")
        var contains = false;
        for (var i = 0; i < j.length; i++)
        {
            if (j[i] === page)
            {
                contains = true;
                break;
            }
        }
        if (contains)
        {
            removeFromWorkingSetButton(page)
        }
        else
        {
            addToWorkingSetButton(page)
        }
    });
}

function addToWorkingSetButton(page)
{
    $('#removefromworkingset').detach()
    $('#toolsform').append('<input id="addtoworkingset" data-page="' + page + '" type="button" value="Add to WorkingSet">')
    $("#addtoworkingset").click(function(){
        $.post('/api/working/' + page, function() { removeFromWorkingSetButton(page) });
    });
}

function removeFromWorkingSetButton(page)
{
    $('#addtoworkingset').detach()
    $('#toolsform').append('<input id="removefromworkingset" data-page="' + page + '" type="button" value="Remove from WorkingSet">')
    $('#removefromworkingset').click(function() {
        $.ajax('/api/working/' + page, {"type" : "DELETE"})
            .success(function() { addToWorkingSetButton(page) } );
    });
}

function pageTags(page)
{
    $.get('/api/tags/' + page, function(t) {
        var j = eval("(" + t + ")")
        var tags = ""
        for (var i = 0; i < j.length; i++)
        {
            if (i > 0)
            {
                tags += ", "
            }
            tags += j[i]
        }
        $('#wiki').append('<strong>Tags</strong>&nbsp;<input type="text" data-page="' + page + '" id="tags" name="tags" value="' + tags + '">')
        $('#tags').blur(function() {
            var body = $(this)[0].value
            var obj = { tags : body }
            $.post('/api/tags/' + page, obj)
        });
    });
}

function pageWorks(page)
{
    $.get('/api/page/' + page + "/works", function(t) {
        var j = eval("(" + t + ")")
        var works = ""
        for (var i = 0; i < j.length; i++)
        {
            if (i > 0)
            {
                works += ", "
            }
            works += "<em>" + j[i] + "</em>"
        }
        if (works === "")
        {
            return;
        }
        var plural = ""
        if (j.length > 1)
        {
            plural = "s"
        }
        $('#list_of_works').html("in work" + plural + " " + works)
    })
}