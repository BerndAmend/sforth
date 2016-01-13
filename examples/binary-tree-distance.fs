include forth.fs
include console.fs
// Program to find distance between n1 and n2 using one traversal
// inspired by http://www.geeksforgeeks.org/find-distance-two-given-nodes/

// root is reserved by node.js :(

// A binary Tree Node
: Node { key }
	key to this.key
	null to this.left
	null to this.right
;

// Returns level of key k if it is present in tree, otherwise returns -1
: findLevel { croot k level -- level-of-key/-1 }
	// Base case
	' croot null === if -1 exit endif

	// If key is present at croot, or in left subtree or right subtree,
	// return true
	croot.key k = if level exit endif

	croot.left k level 1+ findLevel { l }
	l -1 <> if
		l
	else
		croot.right k level 1+ findLevel
	endif
;

// This function returns pointer to LCA of two given values n1 and n2.
// It also sets d1, d2 and dist if one key is not ancestor of other
// d1 --> To store distance of n1 from croot
// d2 --> To store distance of n2 from croot
// lvl --> Level (or distance from croot) of current node
// dist --> To store distance between n1 and n2
: findDistUtil { croot n1 n2 d1 d2 dist lvl -- croot d1 d2 dist }

    // Base case
    ' croot null === if
		null d1 d2 dist
		exit
    endif

    // If either n1 or n2 matches with croot's key, report
    // the presence by returning croot (Note that if a key is
    // ancestor of other, then the ancestor key becomes LCA
    croot.key n1 = if
         ' croot lvl d2 dist
         exit
    endif
    croot.key n2 = if
         ' croot d1 lvl dist
         exit
    endif

    // Look for n1 and n2 in left and right subtrees
    ' croot.left  n1 n2 d1 d2 dist lvl 1+ findDistUtil { left_lca d1 d2 dist }
    ' croot.right n1 n2 d1 d2 dist lvl 1+ findDistUtil { right_lca d1 d2 dist }

    // If both of the above calls return Non-NULL, then one key
    // is present in once subtree and other is present in other,
    // So this node is the LCA
    ' left_lca null <> ' right_lca null <> && if
        ' croot d1 d2  d1 d2 + lvl 2* -
        exit
    endif

    // Otherwise check if left subtree or right subtree is LCA
    ' left_lca null !== if
		' left_lca d1 d2 dist
	else
		' right_lca d1 d2 dist
	endif
;

// The main function that returns distance between n1 and n2
// This function returns -1 if either n1 or n2 is not present in
// Binary Tree.
: findDistance { croot n1 n2 -- int }

    // Initialize d1 (distance of n1 from croot), d2 (distance of n2
    // from croot) and dist(distance between n1 and n2)
    -1 -1 0 { d1 d2 dist }

    ' croot n1 n2 d1 d2 dist 1 findDistUtil { lca d1 d2 dist }

    // If both n1 and n2 were present in Binary Tree, return dist
    d1 -1 <> d2 -1 <> && if
        dist
        exit
    endif

    // If n1 is ancestor of n2, consider n1 as croot and find level
    // of n2 in subtree crooted with n1
    d1 -1 <> if
        ' lca n2 0 findLevel
        exit
    endif

    // If n2 is ancestor of n1, consider n2 as croot and find level
    // of n1 in subtree crooted with n2
    d2 -1 <> if
        ' lca n1 0 findLevel
        exit
    endif

    -1
;

// Let us create binary tree given in the above example
1 new Node { tree-root }
2 new Node to tree-root.left
3 new Node to tree-root.right
4 new Node to tree-root.left.left
5 new Node to tree-root.left.right
6 new Node to tree-root.right.left
7 new Node to tree-root.right.right
8 new Node to tree-root.right.left.right

tree-root 4 5 findDistance 2 = »Dist(4,5) should be 2« assert
tree-root 4 6 findDistance 4 = »Dist(4,6) should be 4« assert
tree-root 3 4 findDistance 3 = »Dist(3,4) should be 3« assert
tree-root 2 4 findDistance 1 = »Dist(2,4) should be 1« assert
tree-root 8 5 findDistance 5 = »Dist(8,5) should be 5« assert
