// click handlers

function snapshotClick(event, element) {
    var body = $("textarea")[0].value
    var page = $(element).attr("data-page")
    var obj = { content : body, commit : true }
    $.post('/page/' + page, obj)
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
        var frag = columnLayout("works", 4, j, "Works")
        $('body').append(frag)
        centerPopup("#works");
        $("#works").fadeIn("fast")
        $('#backplate').click(function () {
            $("#works").fadeOut("fast").detach()
            $("#backplate").css("display", "none").unbind("click")
        })
        $("#backplate").css("display", "block")
        $(".linkwork").click(function(event) {
            event.preventDefault()
            work = $(this).attr("data-work")
            $.get($(this).attr("href"), function(t) {
                var j = eval('(' + t + ')')
                j = accessLink(j)
                var frag = columnLayout("workpages", 4, j, "Pages in <em>" + work + "</em>")
                $('body').append(frag)
                centerPopup("#workpages");
                $("#workpages").fadeIn("fast");
                $('#backplate').unbind("click");
                $('#backplate').click(function () {
                    $("#workpages").fadeOut("fast").detach()
                    $("#backplate").unbind("click")
                    $('#backplate').click(function () {
                        $("#works").fadeOut("fast").detach()
                        $("#backplate").css("display", "none").unbind("click")
                    })
                })
            });
        });
    });
}

function allPageClick(event, element) {
    event.preventDefault()
    
    $.get('/api/pages', function(t) {
        var j = eval('(' + t + ')')
        j = accessLink(j)
        frag = columnLayout("allpages", 4, j, "All Pages")
        $('body').append(frag)
        centerPopup("#allpages");
        $("#allpages").fadeIn("fast");
        $('#backplate').click(function () {
            $("#allpages").fadeOut("fast").detach()
            $("#backplate").css("display", "none").unbind("click")
        })
        $("#backplate").css("display", "block")
    }) 
}

function workingSetClick(event, element){
    event.preventDefault()
    
    $.get('/api/working', function(t) {
        var j = eval('(' + t + ')')
        j = accessRemoveLink(j, '/api/working', "x")
        frag = columnLayout("workingset", 4, j, "Current Working Set")
        $('body').append(frag)
        centerPopup("#workingset");
        $("#workingset").fadeIn("fast");
        $('#backplate').click(function () {
            $("#workingset").fadeOut("fast").detach()
            $("#backplate").css("display", "none").unbind("click")
        })
        $("#backplate").css("display", "block")
        
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
        var frag = columnLayout("tagcloud", 4, j, "Tags")
        $('body').append(frag)
        centerPopup("#tagcloud");
        $("#tagcloud").fadeIn("fast")
        $('#backplate').click(function () {
            $("#tagcloud").fadeOut("fast").detach()
            $("#backplate").css("display", "none").unbind("click")
        })
        $("#backplate").css("display", "block")
        $(".linktag").click(function(event) {
            event.preventDefault()
            
            tag = $(this).attr('data-tag')
            $.get($(this).attr("href"), function(t) {
                var j = eval('(' + t + ')')
                j = accessLink(j)
                var frag = columnLayout("taggedpages", 4, j, "Pages tagged with <em>" + tag + "</em>")
                $('body').append(frag)
                centerPopup("#taggedpages");
                $("#taggedpages").fadeIn("fast");
                $('#backplate').unbind("click");
                $('#backplate').click(function () {
                    $("#taggedpages").fadeOut("fast").detach()
                    $("#backplate").unbind("click")
                    $('#backplate').click(function () {
                        $("#tagcloud").fadeOut("fast").detach()
                        $("#backplate").css("display", "none").unbind("click")
                    })
                })
            });
        });
    });
}

// layout methods

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

function columnLayout(id, n, pages, title) {
    frag = '<div id="' + id + '"> \
            <strong>' + title + '</strong><br> \
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

// page level operational functions

function periodicSave(page_name)
{
    var body = $("textarea")[0].value
    doSave(page_name, body)
    // save every 30 seconds
    var t = setTimeout("periodicSave('" + page_name + "')", 20000);
}

function doSave(name, body)
{
    var obj = { content : body }
    $.post('/page/' + name, obj)
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