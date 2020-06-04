
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
    * FUNCTION: isArray( value )
    *	Validates if a value is an array.
    *
    * @param {*} value - value to be validated
    * @returns {Boolean} boolean indicating whether value is an array
    */
    function isArray( value ) {
    	return Object.prototype.toString.call( value ) === '[object Array]';
    } // end FUNCTION isArray()

    // EXPORTS //

    var lib = Array.isArray || isArray;

    // MODULES //




    // ISOBJECT //

    /**
    * FUNCTION: isObject( value )
    *	Validates if a value is a object; e.g., {}.
    *
    * @param {*} value - value to be validated
    * @returns {Boolean} boolean indicating whether value is a object
    */
    function isObject( value ) {
    	return ( typeof value === 'object' && value !== null && !lib( value ) );
    } // end FUNCTION isObject()


    // EXPORTS //

    var lib$1 = isObject;

    // MODULES //




    // COVARIANCE //

    /**
    * FUNCTION: covariance( arr1[, arr2,...,opts] )
    *	Computes the covariance between one or more numeric arrays.
    *
    * @param {...Array} arr - numeric array
    * @param {Object} [opts] - function options
    * @param {Boolean} [opts.bias] - boolean indicating whether to calculate a biased or unbiased estimate of the covariance (default: false)
    * @returns {Array} covariance matrix
    */
    function covariance() {
    	var bias = false,
    		args,
    		opts,
    		nArgs,
    		len,
    		deltas,
    		delta,
    		means,
    		C,
    		cov,
    		arr,
    		N, r, A, B, sum, val,
    		i, j, n;

    	args = Array.prototype.slice.call( arguments );
    	nArgs = args.length;

    	if ( lib$1( args[nArgs-1] ) ) {
    		opts = args.pop();
    		nArgs = nArgs - 1;
    		if ( opts.hasOwnProperty( 'bias' ) ) {
    			if ( typeof opts.bias !== 'boolean' ) {
    				throw new TypeError( 'covariance()::invalid input argument. Bias option must be a boolean.' );
    			}
    			bias = opts.bias;
    		}
    	}
    	if ( !nArgs ) {
    		throw new Error( 'covariance()::insufficient input arguments. Must provide array arguments.' );
    	}
    	for ( i = 0; i < nArgs; i++ ) {
    		if ( !Array.isArray( args[i] ) ) {
    			throw new TypeError( 'covariance()::invalid input argument. Must provide array arguments.' );
    		}
    	}
    	if ( Array.isArray( args[0][0] ) ) {
    		// If the first argument is an array of arrays, calculate the covariance over the nested arrays, disregarding any other arguments...
    		args = args[ 0 ];
    	}
    	nArgs = args.length;
    	len = args[ 0 ].length;
    	for ( i = 1; i < nArgs; i++ ) {
    		if ( args[i].length !== len ) {
    			throw new Error( 'covariance()::invalid input argument. All arrays must have equal length.' );
    		}
    	}
    	// [0] Initialization...
    	deltas = new Array( nArgs );
    	means = new Array( nArgs );
    	C = new Array( nArgs );
    	cov = new Array( nArgs );
    	for ( i = 0; i < nArgs; i++ ) {
    		means[ i ] = args[ i ][ 0 ];
    		arr = new Array( nArgs );
    		for ( j = 0; j < nArgs; j++ ) {
    			arr[ j ] = 0;
    		}
    		C[ i ] = arr;
    		cov[ i ] = arr.slice(); // copy!
    	}
    	if ( len < 2 ) {
    		return cov;
    	}
    	// [1] Compute the covariance...
    	for ( n = 1; n < len; n++ ) {

    		N = n + 1;
    		r = n / N;

    		// [a] Extract the values and compute the deltas...
    		for ( i = 0; i < nArgs; i++ ) {
    			deltas[ i ] = args[ i ][ n ] - means[ i ];
    		}

    		// [b] Update the covariance between one array and every other array...
    		for ( i = 0; i < nArgs; i++ ) {
    			arr = C[ i ];
    			delta = deltas[ i ];
    			for ( j = i; j < nArgs; j++ ) {
    				A = arr[ j ];
    				B = r * delta * deltas[ j ];
    				sum = A + B;
    				// Exploit the fact that the covariance matrix is symmetric...
    				if ( i !== j ) {
    					C[ j ][ i ] = sum;
    				}
    				arr[ j ] = sum;
    			} // end FOR j
    		} // end FOR i

    		// [c] Update the means...
    		for ( i = 0; i < nArgs; i++ ) {
    			means[ i ] += deltas[ i ] / N;
    		}
    	} // end FOR n

    	// [2] Normalize the co-moments...
    	n = N - 1;
    	if ( bias ) {
    		n = N;
    	}
    	for ( i = 0; i < nArgs; i++ ) {
    		arr = C[ i ];
    		for ( j = i; j < nArgs; j++ ) {
    			val = arr[ j ] / n;
    			cov[ i ][ j ] = val;
    			if ( i !== j ) {
    				cov[ j ][ i ] = val;
    			}
    		}
    	}
    	return cov;
    } // end FUNCTION covariance()


    // EXPORTS //

    var lib$2 = covariance;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var svdJs_min = createCommonjsModule(function (module, exports) {
    !function(r,f){f(exports);}(commonjsGlobal,function(r){r.SVD=function(r,f,o,t,e){if(f=void 0===f||f,o=void 0===o||o,e=1e-64/(t=t||Math.pow(2,-52)),!r)throw new TypeError("Matrix a is not defined");var a,i,n,s,h,M,l,d,p,u,b,w,q,v=r[0].length,y=r.length;if(y<v)throw new TypeError("Invalid matrix: m < n");var c=[],x=[],m=[];for(a=b=d=0;a<y;a++)x[a]=new Array(v).fill(0);for(a=0;a<v;a++)m[a]=new Array(v).fill(0);var S,k=new Array(v).fill(0);for(a=0;a<y;a++)for(i=0;i<v;i++)x[a][i]=r[a][i];for(a=0;a<v;a++){for(c[a]=d,u=0,s=a+1,i=a;i<y;i++)u+=Math.pow(x[i][a],2);if(u<e)d=0;else for(p=(l=x[a][a])*(d=l<0?Math.sqrt(u):-Math.sqrt(u))-u,x[a][a]=l-d,i=s;i<v;i++){for(u=0,n=a;n<y;n++)u+=x[n][a]*x[n][i];for(l=u/p,n=a;n<y;n++)x[n][i]=x[n][i]+l*x[n][a];}for(k[a]=d,u=0,i=s;i<v;i++)u+=Math.pow(x[a][i],2);if(u<e)d=0;else {for(p=(l=x[a][a+1])*(d=l<0?Math.sqrt(u):-Math.sqrt(u))-u,x[a][a+1]=l-d,i=s;i<v;i++)c[i]=x[a][i]/p;for(i=s;i<y;i++){for(u=0,n=s;n<v;n++)u+=x[i][n]*x[a][n];for(n=s;n<v;n++)x[i][n]=x[i][n]+u*c[n];}}b<(w=Math.abs(k[a])+Math.abs(c[a]))&&(b=w);}if(o)for(a=v-1;0<=a;a--){if(0!==d){for(p=x[a][a+1]*d,i=s;i<v;i++)m[i][a]=x[a][i]/p;for(i=s;i<v;i++){for(u=0,n=s;n<v;n++)u+=x[a][n]*m[n][i];for(n=s;n<v;n++)m[n][i]=m[n][i]+u*m[n][a];}}for(i=s;i<v;i++)m[a][i]=0,m[i][a]=0;m[a][a]=1,d=c[a],s=a;}if(f)for(a=v-1;0<=a;a--){for(s=a+1,d=k[a],i=s;i<v;i++)x[a][i]=0;if(0!==d){for(p=x[a][a]*d,i=s;i<v;i++){for(u=0,n=s;n<y;n++)u+=x[n][a]*x[n][i];for(l=u/p,n=a;n<y;n++)x[n][i]=x[n][i]+l*x[n][a];}for(i=a;i<y;i++)x[i][a]=x[i][a]/d;}else for(i=a;i<y;i++)x[i][a]=0;x[a][a]=x[a][a]+1;}for(t*=b,n=v-1;0<=n;n--)for(var A=0;A<50;A++){for(S=!1,s=n;0<=s;s--){if(Math.abs(c[s])<=t){S=!0;break}if(Math.abs(k[s-1])<=t)break}if(!S)for(M=0,h=s-(u=1),a=s;a<n+1&&(l=u*c[a],c[a]=M*c[a],!(Math.abs(l)<=t));a++)if(d=k[a],k[a]=Math.sqrt(l*l+d*d),M=d/(p=k[a]),u=-l/p,f)for(i=0;i<y;i++)w=x[i][h],q=x[i][a],x[i][h]=w*M+q*u,x[i][a]=-w*u+q*M;if(q=k[n],s===n){if(q<0&&(k[n]=-q,o))for(i=0;i<v;i++)m[i][n]=-m[i][n];break}for(b=k[s],l=(((w=k[n-1])-q)*(w+q)+((d=c[n-1])-(p=c[n]))*(d+p))/(2*p*w),d=Math.sqrt(l*l+1),l=((b-q)*(b+q)+p*(w/(l<0?l-d:l+d)-p))/b,a=s+(u=M=1);a<n+1;a++){if(d=c[a],w=k[a],p=u*d,d*=M,q=Math.sqrt(l*l+p*p),l=b*(M=l/(c[a-1]=q))+d*(u=p/q),d=-b*u+d*M,p=w*u,w*=M,o)for(i=0;i<v;i++)b=m[i][a-1],q=m[i][a],m[i][a-1]=b*M+q*u,m[i][a]=-b*u+q*M;if(q=Math.sqrt(l*l+p*p),l=(M=l/(k[a-1]=q))*d+(u=p/q)*w,b=-u*d+M*w,f)for(i=0;i<y;i++)w=x[i][a-1],q=x[i][a],x[i][a-1]=w*M+q*u,x[i][a]=-w*u+q*M;}c[s]=0,c[n]=l,k[n]=b;}for(a=0;a<v;a++)k[a]<t&&(k[a]=0);return {u:x,q:k,v:m}},r.VERSION="1.0.6",Object.defineProperty(r,"__esModule",{value:!0});});
    });

    var SingularValueDecomposition = unwrapExports(svdJs_min);

    var citedCoordinates = [{"x0": -0.1252544806171376, "y0": -0.16223114465428032, "grouping1": 0, "grouping2": 0, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 0, "Author": "Ghassan AlRegib", "URL": "https://scholar.google.com/citations?user=7k5QSdoAAAAJ", "KeyWords": "Machine Learning, Image and Video Processing, Perception and Scene Understanding, Computational Seismic Interpretation, Machine", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=7k5QSdoAAAAJ", "Citations": "3086.0", "Affiliation": "School of Electrical and Computer Engineering, Georgia Tech", "x1": -0.14125936253747698, "y1": -0.1495038064991813, "x2": -0.11138997794045179, "y2": 0.18520322225148297, "x3": -0.09666815845435946, "y3": 0.17316440805939506, "x4": -0.11150093689543826, "y4": 0.14670146942942966, "x5": -0.13353380193780862, "y5": 0.1857884777363195}, {"x0": -0.11224355186965482, "y0": 0.4427494796885539, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 3, "grouping5": 2, "grouping6": 4, "Author": "Srinivas Aluru", "URL": "https://scholar.google.com/citations?user=YOGOScoAAAAJ", "KeyWords": "Bioinformatics, High performance Computing, Parallel Algorithms and Applications, Systems Biology", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=YOGOScoAAAAJ", "Citations": "10747.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.17858748815023906, "y1": 0.3734894958493273, "x2": 0.20837689907540727, "y2": -0.3106292835438283, "x3": 0.22253779343302477, "y3": -0.28517071156870055, "x4": 0.2675653844479233, "y4": -0.22993627945077827, "x5": 0.3099444465329463, "y5": -0.08139817425180354}, {"x0": -0.10301982712908483, "y0": 0.0715153400817353, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "David V. Anderson", "URL": "https://scholar.google.com/citations?user=b9_uwfcAAAAJ", "KeyWords": "", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=b9_uwfcAAAAJ", "Citations": "3754.0", "Affiliation": "Georgia Tech", "x1": 0.1768081910113378, "y1": 0.2387158856364041, "x2": 0.23620380421052414, "y2": -0.31050205811433945, "x3": 0.2742874602474061, "y3": -0.3624139040491445, "x4": 0.3556729390259781, "y4": -0.3400791649851048, "x5": 0.44330287312160943, "y5": -0.18941498743989638}, {"x0": -0.24079478142924868, "y0": -0.002230736792317732, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Manos Antonakakis", "URL": "https://scholar.google.com/citations?user=P6VJcVIAAAAJ", "KeyWords": "Computer and Network Security", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=P6VJcVIAAAAJ", "Citations": "3451.0", "Affiliation": "Georgia Institute of Technology", "x1": -0.012345743001539046, "y1": 0.23693899174333935, "x2": 0.05072279450470356, "y2": -0.19502054650999123, "x3": 0.08316563560919733, "y3": -0.18868526376118067, "x4": 0.1291882453405187, "y4": -0.17064801258148618, "x5": 0.1735140348785367, "y5": -0.06233511227743935}, {"x0": -0.3082848420589553, "y0": -0.1919440135869673, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 2, "grouping5": 1, "grouping6": 5, "Author": "Ronald C. Arkin", "URL": "https://scholar.google.com/citations?user=WSN7T_YAAAAJ", "KeyWords": "artificial intelligence, robotics, robot ethics, autonomous agents", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=WSN7T_YAAAAJ", "Citations": "28777.0", "Affiliation": "Regents Professor of Computer Science, Georgia Tech", "x1": -0.6193930915709223, "y1": 0.22389716000303925, "x2": -0.61940880009942, "y2": -0.3302109257000495, "x3": -0.6001785308851615, "y3": -0.3659337453734998, "x4": -0.5176562151344046, "y4": -0.4738817329618673, "x5": -0.3813396129497506, "y5": -0.5116115404516828}, {"x0": -0.14739105409037906, "y0": 0.19880387352819254, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Matthieu Bloch", "URL": "https://scholar.google.com/citations?user=cglpZYQAAAAJ", "KeyWords": "Information theory, coding theory, wireless communications", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=cglpZYQAAAAJ", "Citations": "5744.0", "Affiliation": "Associate Professor of Electrical and Computer Engineering, Georgia Tech", "x1": 0.07392474855877335, "y1": 0.22299168593486057, "x2": 0.10947411468296739, "y2": -0.1841915894636982, "x3": 0.12937817797413714, "y3": -0.17688251875141572, "x4": 0.16780456528799048, "y4": -0.14921247524929906, "x5": 0.20292814339403856, "y5": -0.02881820403895574}, {"x0": -0.15294611117024653, "y0": -0.17108031525287412, "grouping1": 0, "grouping2": 0, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 0, "Author": "Duen Horng “Polo” Chau", "URL": "https://scholar.google.com/citations?user=YON32W4AAAAJ", "KeyWords": "AI Security, Explainable AI, Visual Analytics, Adversarial Machine Learning, Graph Visualization", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=YON32W4AAAAJ", "Citations": "4333.0", "Affiliation": "Professor of Computer Science, Georgia Tech", "x1": -0.05076596695911405, "y1": -0.025899413887603914, "x2": 0.0016809085574680767, "y2": 0.044903947625878876, "x3": 0.02669879109489092, "y3": 0.04113559172271938, "x4": 0.030669796484740216, "y4": 0.04469359040173588, "x5": 0.025689037549544994, "y5": 0.12529309620573073}, {"x0": 0.28703745336420544, "y0": 0.02989294919458467, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Yongxin Chen", "URL": "https://scholar.google.com/citations?user=X8BYiV4AAAAJ", "KeyWords": "control theory, optimal mass transport, machine learning, robotics, optimization", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=X8BYiV4AAAAJ", "Citations": "819.0", "Affiliation": "Assistant Professor", "x1": -0.04488382925505115, "y1": -0.08799996845436364, "x2": -0.10771288304901724, "y2": 0.009918240037367208, "x3": -0.12122907333693861, "y3": 0.0013369500305538753, "x4": -0.12762743098726703, "y4": -0.02123107676202269, "x5": -0.11776837942660563, "y5": 0.023467383362251328}, {"x0": 0.015687793803176128, "y0": 0.04515189708864867, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "Rachel Cummings", "URL": "https://scholar.google.com/citations?user=2mYxmokAAAAJ", "KeyWords": "Data privacy, Machine learning, Algorithmic economics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=2mYxmokAAAAJ", "Citations": "636.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.060509959774902304, "y1": -0.00531448963081221, "x2": 0.06669945503581581, "y2": 0.03908348544525923, "x3": 0.06578432063246051, "y3": 0.05590173618091233, "x4": 0.050337503880823455, "y4": 0.07663952292361091, "x5": 0.02587230592032195, "y5": 0.1649181322898996}, {"x0": 0.15042397789202533, "y0": -0.05711799670078128, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 3, "Author": "Mark A. Davenport", "URL": "https://scholar.google.com/citations?user=DpuKx_oAAAAJ", "KeyWords": "Signal processing, Statistical inference, Machine learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=DpuKx_oAAAAJ", "Citations": "11424.0", "Affiliation": "Associate Professor of Electrical & Computer Engineering, Georgia Institute of Technology", "x1": 0.1790780036147147, "y1": -0.31849339243098, "x2": 0.16283899502166205, "y2": 0.3865551580315877, "x3": 0.1411993876365362, "y3": 0.42357662831869636, "x4": 0.0605393992204894, "y4": 0.4572767868481108, "x5": -0.05449931676535577, "y5": 0.5422989364971795}, {"x0": -0.13082306815831735, "y0": 0.0731663918791362, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "Constantine Dovrolis", "URL": "https://scholar.google.com/citations?user=sfuwsSwAAAAJ", "KeyWords": "Networks", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=sfuwsSwAAAAJ", "Citations": "13720.0", "Affiliation": "Professor of Computer Science, Georgia Tech", "x1": 0.06529466548207322, "y1": 0.21883499338431117, "x2": 0.11347973752901369, "y2": -0.1881883634842029, "x3": 0.14206075707322838, "y3": -0.1773681212363021, "x4": 0.1817920118844478, "y4": -0.1459303341045665, "x5": 0.21777395562368612, "y5": -0.02425338291200592}, {"x0": 0.058951583130429884, "y0": -0.15696093346104734, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 3, "Author": "Eva L. Dyer", "URL": "https://scholar.google.com/citations?user=Sb_jcHcAAAAJ", "KeyWords": "Computational Neuroscience, Machine Learning, Signal Processing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Sb_jcHcAAAAJ", "Citations": "385.0", "Affiliation": "Assistant Professor at Georgia Institute of Technology", "x1": 0.0851623407683616, "y1": -0.3508697769931192, "x2": 0.08394951331179012, "y2": 0.4270840192364536, "x3": 0.06745435243252385, "y3": 0.43321467635700717, "x4": -0.007492521195109827, "y4": 0.4274318883198644, "x5": -0.10725426651551065, "y5": 0.48235969822232055}, {"x0": -0.16591095277191575, "y0": -0.25938589735498396, "grouping1": 0, "grouping2": 0, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 0, "Author": "Irfan Essa", "URL": "https://scholar.google.com/citations?user=XM97iScAAAAJ", "KeyWords": "Computer Vision, Computer Graphics, Machine Learning, Artificial Intelligence, Robotics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=XM97iScAAAAJ", "Citations": "17256.0", "Affiliation": "Distinguished Professor of Computing, Georgia Tech , Research Scientist, Google", "x1": -0.5098099479027735, "y1": -0.11023591139257827, "x2": -0.5617424534887974, "y2": 0.0538347404663212, "x3": -0.5736359459057172, "y3": 0.014887733826580825, "x4": -0.5721212333239332, "y4": -0.10331244125581322, "x5": -0.5320558773703109, "y5": -0.17397421693236742}, {"x0": -0.11608741580806366, "y0": 0.1204561331696083, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "Faramarz Fekri", "URL": "https://scholar.google.com/citations?user=sB1XU4kAAAAJ", "KeyWords": "Information Theory, Graphical Models, Reinforcement Learning, Biology, Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=sB1XU4kAAAAJ", "Citations": "4473.0", "Affiliation": "Georgia Tech", "x1": 0.02182958715894433, "y1": -0.013743901516959332, "x2": 0.026908735593463722, "y2": 0.09670716961991456, "x3": 0.033040703602280445, "y3": 0.11402886567324588, "x4": 0.01243592672305472, "y4": 0.12504764727809728, "x5": -0.02134848002586349, "y5": 0.20289484173782577}, {"x0": -0.05519050850358494, "y0": 0.09846893505931552, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "Nagi Gebraeel", "URL": "https://scholar.google.com/citations?user=hL8pnrMAAAAJ", "KeyWords": "Prognostics, Condition monitoring, Reliability", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=hL8pnrMAAAAJ", "Citations": "3444.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.10454084966401585, "y1": 0.16966852409854738, "x2": 0.1312513199950844, "y2": -0.16577364616205736, "x3": 0.14435552692101508, "y3": -0.17041610867753998, "x4": 0.17821691314961477, "y4": -0.15069841766057568, "x5": 0.21356412288651602, "y5": -0.030467845721431103}, {"x0": -0.17574615635410595, "y0": -0.3776396989163534, "grouping1": 0, "grouping2": 0, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 0, "Author": "James Hays", "URL": "https://scholar.google.com/citations?user=vjZrDKQAAAAJ", "KeyWords": "Computer Vision, Robotics, Machine Learning, AI", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=vjZrDKQAAAAJ", "Citations": "19267.0", "Affiliation": "Georgia Tech", "x1": -0.3780608197148408, "y1": -0.20160662145123445, "x2": -0.41125501641626616, "y2": 0.17156548184607545, "x3": -0.4409573571563355, "y3": 0.14591743356113787, "x4": -0.4813376451105699, "y4": 0.05328201758351952, "x5": -0.49170679806378204, "y5": -0.006738714559052256}, {"x0": -0.16011381197509136, "y0": -0.4110154076641539, "grouping1": 0, "grouping2": 0, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 0, "Author": "Judy Hoffman", "URL": "https://scholar.google.com/citations?user=mqpjAt4AAAAJ", "KeyWords": "Artificial Intelligence, Computer Vision, Deep Learning, Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=mqpjAt4AAAAJ", "Citations": "9402.0", "Affiliation": "Assistant Professor, Georgia Tech", "x1": -0.361731060211729, "y1": -0.2355086164688617, "x2": -0.40096066459673957, "y2": 0.21522196276000802, "x3": -0.4346493972514513, "y3": 0.18200705917220422, "x4": -0.4718124895624526, "y4": 0.08577958090835455, "x5": -0.48351555086138526, "y5": 0.029202854205707618}, {"x0": 0.14759922833650613, "y0": -0.09445364768531814, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 3, "Author": "Xiaoming Huo", "URL": "https://scholar.google.com/citations?user=YNQLrPgAAAAJ", "KeyWords": "statistics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=YNQLrPgAAAAJ", "Citations": "5201.0", "Affiliation": "Professor, Georgia Institute of Technology", "x1": 0.20050422808679094, "y1": -0.10760750473148831, "x2": 0.21327961002210558, "y2": 0.07478887823806771, "x3": 0.2215947284582259, "y3": 0.07537937993078611, "x4": 0.2137392289949709, "y4": 0.11989201669328202, "x5": 0.18509709427603352, "y5": 0.24666301892478437}, {"x0": -0.19875812947606225, "y0": -0.48091642043442545, "grouping1": 0, "grouping2": 0, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 0, "Author": "Zsolt Kira", "URL": "https://scholar.google.com/citations?user=2a5XgNAAAAAJ", "KeyWords": "Machine Learning, Perception, Robotics, Artificial Intelligence", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=2a5XgNAAAAAJ", "Citations": "1068.0", "Affiliation": "Assistant Professor, Georgia Institute of Technology", "x1": -0.5974687235936519, "y1": -0.15799210882484352, "x2": -0.6350981732427677, "y2": 0.062451290918184944, "x3": -0.6435056579335127, "y3": 0.022649229612535775, "x4": -0.6351145532020978, "y4": -0.09091201250168168, "x5": -0.591712159776476, "y5": -0.170590261113613}, {"x0": 0.5385444705552856, "y0": 0.10825622878934048, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Guanghui (George) Lan", "URL": "https://scholar.google.com/citations?user=l3SflUcAAAAJ", "KeyWords": "Mathematical Optimization, Stochastic Programming, Nonlinear Programming, Machine Learning, Image Processing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=l3SflUcAAAAJ", "Citations": "4992.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.2895074935427989, "y1": -0.15469536197918116, "x2": 0.22295168808983098, "y2": 0.038787449078414304, "x3": 0.20019622591869843, "y3": 0.04086614504338909, "x4": 0.17848102057158843, "y4": 0.0785592179901303, "x5": 0.1502023757218544, "y5": 0.18934426403290033}, {"x0": 0.18478452623799446, "y0": 0.12252121163660386, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Siva Theja Maguluri", "URL": "https://scholar.google.com/citations?user=Y4e61JcAAAAJ", "KeyWords": "Applied Probability, Optimization, Reinforcement Learning, Resource Allocation Algorithms, Networks", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Y4e61JcAAAAJ", "Citations": "670.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.20204036236852682, "y1": 0.0306308110132921, "x2": 0.19012587781500884, "y2": -0.04690651803771414, "x3": 0.1876049432661752, "y3": -0.03431283368468305, "x4": 0.18536324525228862, "y4": 0.004216776454089145, "x5": 0.17505928249834238, "y5": 0.12181301525339194}, {"x0": -0.29574706163517833, "y0": 0.5285205648603365, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 3, "grouping5": 2, "grouping6": 4, "Author": "Cassie S. Mitchell", "URL": "https://scholar.google.com/citations?user=FpxAYrgAAAAJ", "KeyWords": "Predictive Medicine, Big Data, Machine Learning, ALS, Alzheimers", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=FpxAYrgAAAAJ", "Citations": "488.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.06395691731604104, "y1": 0.3698258618552102, "x2": 0.09727847420219247, "y2": -0.2273049763212779, "x3": 0.10973041315364035, "y3": -0.17125129143411094, "x4": 0.1364228549916974, "y4": -0.1267500318748636, "x5": 0.15903808477759762, "y5": -0.005178972640323132}, {"x0": -0.09494586518788076, "y0": 0.10023117535722538, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "Benoit Montreuil", "URL": "https://scholar.google.com/citations?user=fLLmxRsAAAAJ", "KeyWords": "layout, physical Internet, logistics, business design, networked manufacturing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=fLLmxRsAAAAJ", "Citations": "5586.0", "Affiliation": "Professor, School of Industrial and Systems Engineering, Georgia Institute of Technology, Atlanta", "x1": 0.036212888121355764, "y1": 0.32453267462579727, "x2": 0.08221777058988353, "y2": -0.29827274292167183, "x3": 0.1134796633037487, "y3": -0.2807500876437931, "x4": 0.17352388167008886, "y4": -0.2451332720748346, "x5": 0.23283535546873138, "y5": -0.11518190059713107}, {"x0": -0.19605660993273424, "y0": 0.20827125984747824, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Saibal Mukhopadhyay", "URL": "https://scholar.google.com/citations?user=5KRtMEkAAAAJ", "KeyWords": "Circuit design, low power", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=5KRtMEkAAAAJ", "Citations": "10201.0", "Affiliation": "Professor of Electrical Engineering, Georgia Institute of Technology", "x1": 0.08637960028560658, "y1": 0.3338891747414389, "x2": 0.13029935556782868, "y2": -0.29311758638654717, "x3": 0.15138274249366168, "y3": -0.2760190976669347, "x4": 0.20192275106723434, "y4": -0.2364294861036784, "x5": 0.25193150493930705, "y5": -0.10179818632347049}, {"x0": 0.49771410762316526, "y0": 0.11381210307949234, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Arkadi Nemirovski", "URL": "https://scholar.google.com/citations?user=3QxoymwAAAAJ", "KeyWords": "optimization, operations research, convex optimization, nonparametric statistics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=3QxoymwAAAAJ", "Citations": "45657.0", "Affiliation": "Professor and Jh. Hunter  Academic Chair, School of Industrial and Systems Engineering, Georgia", "x1": 0.32589542091836277, "y1": -0.05996931405981363, "x2": 0.2715064598815735, "y2": -0.06976748483569181, "x3": 0.2562438581104965, "y3": -0.08258904757090706, "x4": 0.2641895032579903, "y4": -0.040529859267133185, "x5": 0.2673288145123891, "y5": 0.09249077811561567}, {"x0": -0.2421068570909864, "y0": 0.06219185074456448, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Chethan Pandarinath", "URL": "https://scholar.google.com/citations?user=M3-z9G4AAAAJ", "KeyWords": "neuroengineering, brain-machine interfaces, systems neuroscience, motor control, deep learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=M3-z9G4AAAAJ", "Citations": "1376.0", "Affiliation": "Asst. Prof. of Biomedical Engineering, Emory University and Georgia Tech", "x1": -0.04979533269131372, "y1": -0.09357230885360357, "x2": 0.005692859005163428, "y2": 0.20353596086723735, "x3": 0.02348392444053988, "y3": 0.19880808776919548, "x4": 0.004872749521410792, "y4": 0.19181688816744588, "x5": -0.030262327349694054, "y5": 0.25907462551917904}, {"x0": 0.06725249832127593, "y0": 0.00957496600910537, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 1, "Author": "Haesun Park", "URL": "https://scholar.google.com/citations?user=G6kA1CMAAAAJ", "KeyWords": "Numerical Algorithms, Data Analysis, Visual Analytics, Parallel Computing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=G6kA1CMAAAAJ", "Citations": "18227.0", "Affiliation": "Regents Professor of Computational Science and Engineering, Georgia Institute of Technology", "x1": 0.15486338653770923, "y1": 0.08225085211409876, "x2": 0.1691738452173836, "y2": -0.11494057960451574, "x3": 0.17833284549765657, "y3": -0.12809275364588754, "x4": 0.19992334377743037, "y4": -0.10155572693411863, "x5": 0.21992732330066875, "y5": 0.015574104258847234}, {"x0": -0.27092428114078726, "y0": 0.09980938698338564, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Thomas Ploetz", "URL": "https://scholar.google.com/citations?user=kM95eWgAAAAJ", "KeyWords": "Computational Behavior Analysis, Activity Recognition, Ubiquitous Computing, Health, Applied Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=kM95eWgAAAAJ", "Citations": "4440.0", "Affiliation": "Georgia Institute of Technology", "x1": -0.08928697727191959, "y1": 0.04586441809066637, "x2": -0.047064673640070206, "y2": 0.021548095690269976, "x3": -0.032202117354933245, "y3": 0.03008014752207936, "x4": -0.030407648964097207, "y4": 0.027499264827318095, "x5": -0.03462723354343415, "y5": 0.09408057462922717}, {"x0": -0.1622217286743232, "y0": 0.31078182269665244, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 3, "grouping5": 2, "grouping6": 5, "Author": "Peng Qiu", "URL": "https://scholar.google.com/citations?user=huPJapcAAAAJ", "KeyWords": "Bioinformatics and Computational Biology", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=huPJapcAAAAJ", "Citations": "5419.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.13539475695729844, "y1": 0.333478614974495, "x2": 0.1692814137923815, "y2": -0.27203320033827644, "x3": 0.18062070987219536, "y3": -0.2600745858907026, "x4": 0.2219657811536097, "y4": -0.22286497868389124, "x5": 0.26573576747545063, "y5": -0.09214709505835522}, {"x0": -0.24011242927206283, "y0": 0.037802235928676146, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Mark Riedl", "URL": "https://scholar.google.com/citations?user=Yg_QjxcAAAAJ", "KeyWords": "Artificial intelligence, Machine Learning, Storytelling, Game AI, Computer Games", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Yg_QjxcAAAAJ", "Citations": "5569.0", "Affiliation": "Associate Professor of Interactive Computing, Georgia Institute of Technology", "x1": -0.2493642386519757, "y1": 0.12933896595080024, "x2": -0.25700839950994525, "y2": -0.10607204074373112, "x3": -0.26187799629514, "y3": -0.1072465030910155, "x4": -0.2408161712844118, "y4": -0.15088893714600868, "x5": -0.2016194989700727, "y5": -0.12960844941891048}, {"x0": 0.10565205785751623, "y0": -0.017785961897952764, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 1, "Author": "Christopher Rozell", "URL": "https://scholar.google.com/citations?user=JHuo2D0AAAAJ", "KeyWords": "Computational neuroscience, Neuroengineering, Machine learning, Signal processing, Brain-machine interfaces", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=JHuo2D0AAAAJ", "Citations": "2228.0", "Affiliation": "Professor of Electrical and Computer Engineering, Georgia Institute of Technology", "x1": 0.09139291566207561, "y1": -0.2699038328842266, "x2": 0.0946207668400099, "y2": 0.3692634868090287, "x3": 0.09010777449133943, "y3": 0.36735134143236514, "x4": 0.029765615643515212, "y4": 0.3681160065774302, "x5": -0.052243253131865064, "y5": 0.4320470746839307}, {"x0": 0.17258737472904306, "y0": -0.19217953104769323, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 3, "Author": "Le Song", "URL": "https://scholar.google.com/citations?user=Xl4E0CsAAAAJ", "KeyWords": "Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Xl4E0CsAAAAJ", "Citations": "11652.0", "Affiliation": "Georgia Institute of Technology", "x1": 0.07652630723620014, "y1": -0.31340996677384414, "x2": 0.04314041444340533, "y2": 0.36562089248931134, "x3": 0.007359434371492095, "y3": 0.40890308028043365, "x4": -0.09788128612432596, "y4": 0.4312132436667027, "x5": -0.22731276453228413, "y5": 0.48114147224106607}, {"x0": 0.11063989025581783, "y0": -0.17644987833350748, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 3, "Author": "Evangelos Theodorou", "URL": "https://scholar.google.com/citations?user=dG9MV7oAAAAJ", "KeyWords": "Stochastic Control Theory, Machine Learning, Statistical Physics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=dG9MV7oAAAAJ", "Citations": "3885.0", "Affiliation": "Georgia Institute of Technology", "x1": -0.05031310886637814, "y1": -0.19954833530552152, "x2": -0.03962423571435882, "y2": 0.17526323273862596, "x3": -0.029134984567226418, "y3": 0.1982010319721553, "x4": -0.056093665253511456, "y4": 0.20320371249105887, "x5": -0.10033765291875292, "y5": 0.26950905810131287}, {"x0": -0.01726760357670225, "y0": 0.05160153016243562, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 1, "Author": "Panagiotis Tsiotras", "URL": "https://scholar.google.com/citations?user=qmVayjgAAAAJ", "KeyWords": "controls, robotics, artificial intelligence, flying robots, spacecraft", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=qmVayjgAAAAJ", "Citations": "11415.0", "Affiliation": "Georgia Institute of Technology", "x1": -0.43803278119044187, "y1": 0.22649450432359364, "x2": -0.48746949597883454, "y2": -0.32982279719474195, "x3": -0.49690199405228896, "y3": -0.35894838787988914, "x4": -0.42616944771835114, "y4": -0.4486981330822083, "x5": -0.30488394088142023, "y5": -0.4666932591423192}, {"x0": 0.1431443963289288, "y0": 0.10786718981385077, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Pascal Van Hentenryck", "URL": "https://scholar.google.com/citations?user=GxFQz-4AAAAJ", "KeyWords": "Artificial Intelligence, Data Science, Operations Research, Mobility, Energy", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=GxFQz-4AAAAJ", "Citations": "20067.0", "Affiliation": "Georgia Institute of Technology", "x1": -0.06833324661782827, "y1": 0.161927458162494, "x2": -0.14669973749316817, "y2": -0.25765579161618474, "x3": -0.18747488386253633, "y3": -0.28588348221721444, "x4": -0.14082347581623042, "y4": -0.3249036050039263, "x5": -0.06146271455598359, "y5": -0.2830525700035327}, {"x0": 0.3672686496344871, "y0": -0.03658969482356938, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Santosh S. Vempala", "URL": "https://scholar.google.com/citations?user=hRggMmIAAAAJ", "KeyWords": "Algorithms, Randomness, High-dimensional Geometry, Optimization, Foundations of Data Science", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=hRggMmIAAAAJ", "Citations": "15165.0", "Affiliation": "Georgia Tech", "x1": 0.27924093474274325, "y1": -0.08149036074661979, "x2": 0.2470733752441947, "y2": -0.02414451163424146, "x3": 0.23487930418226155, "y3": -0.05445463926300322, "x4": 0.23637751210805275, "y4": -0.032215173350231656, "x5": 0.23893397613308195, "y5": 0.08187391059217819}, {"x0": 0.22703379565689183, "y0": -0.08744347084492554, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 3, "Author": "Yao C. Xie", "URL": "https://scholar.google.com/citations?user=qvYp8ZQAAAAJ", "KeyWords": "signal processing, statistics, machine learning.", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=qvYp8ZQAAAAJ", "Citations": "2006.0", "Affiliation": "Associate Professor, Nash Early Career Professor, Georgia Institute of Technology", "x1": 0.21302950945581972, "y1": -0.3435431201165145, "x2": 0.18445024217660883, "y2": 0.3997818675179628, "x3": 0.15612676183737687, "y3": 0.44680437692231595, "x4": 0.05753669695809653, "y4": 0.49736897380240735, "x5": -0.07165359239760394, "y5": 0.5842204158600022}, {"x0": -0.20051235562632216, "y0": 0.002307256009963922, "grouping1": 0, "grouping2": 0, "grouping3": 1, "grouping4": 0, "grouping5": 3, "grouping6": 5, "Author": "Diyi Yang", "URL": "https://scholar.google.com/citations?user=j9jhYqQAAAAJ", "KeyWords": "Natural Language Processing, Computational Social Science, Social Computing, Machine Learning, Educational Data Mining", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=j9jhYqQAAAAJ", "Citations": "3850.0", "Affiliation": "Georgia Tech", "x1": -0.03670205244344688, "y1": -0.027413467218182566, "x2": -0.006344345267590986, "y2": 0.07786835241341765, "x3": -0.0005826970339522091, "y3": 0.08695226392908767, "x4": -0.00922966500957969, "y4": 0.08565278977798182, "x5": -0.027271092504599873, "y5": 0.1537225300679071}, {"x0": 0.0940995578115307, "y0": -0.17700755999200413, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 4, "grouping6": 3, "Author": "Hongyuan Zha 査宏远", "URL": "https://scholar.google.com/citations?user=tqEWl8gAAAAJ", "KeyWords": "Machine learning applications", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=tqEWl8gAAAAJ", "Citations": "22131.0", "Affiliation": "College of Computing, Georgia Institute of Technology", "x1": 0.068194630609351, "y1": -0.25315103116300613, "x2": 0.04292300197917943, "y2": 0.31570305286516015, "x3": 0.01065562153271368, "y3": 0.35873187905199405, "x4": -0.08306711032001275, "y4": 0.3808585146699041, "x5": -0.19772271703654418, "y5": 0.4346843891538204}, {"x0": 0.4216874794030809, "y0": -0.1382042584327923, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Tuo Zhao", "URL": "https://scholar.google.com/citations?user=EJXN6tYAAAAJ", "KeyWords": "Machine Learning, Nonconvex Optimization, Statistics, Natural Language Processing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=EJXN6tYAAAAJ", "Citations": "2971.0", "Affiliation": "Assistant Professor, Georgia Tech", "x1": 0.21407153839063425, "y1": -0.3425521887016485, "x2": 0.16616273487167177, "y2": 0.2973930705549125, "x3": 0.1434870141011143, "y3": 0.30538853374782937, "x4": 0.08018501304984185, "y4": 0.3305866679426501, "x5": -0.0029539878661244924, "y5": 0.4134854423587893}, {"x0": 0.3223506426074645, "y0": 0.24688278626706117, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Enlu Zhou", "URL": "https://scholar.google.com/citations?user=LTKmex0AAAAJ", "KeyWords": "", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=LTKmex0AAAAJ", "Citations": "697.0", "Affiliation": "Associate Professor, School of Industrial and Systems Engineering, Georgia Institute of Technology", "x1": 0.3145995580657252, "y1": 0.18125472758247338, "x2": 0.31001468918110503, "y2": -0.3075284148881823, "x3": 0.3237499224015182, "y3": -0.3587934967106972, "x4": 0.3906596124383951, "y4": -0.3300254257190345, "x5": 0.46840652037057284, "y5": -0.17572132942679838}];

    var recentCoordinates = [{"x0": -0.24876929549513016, "y0": -0.21063996045769373, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 0, "Author": "Ghassan AlRegib", "URL": "https://scholar.google.com/citations?user=7k5QSdoAAAAJ", "KeyWords": "Machine Learning, Image and Video Processing, Perception and Scene Understanding, Computational Seismic Interpretation, Machine", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=7k5QSdoAAAAJ", "Citations": "3086", "Affiliation": "School of Electrical and Computer Engineering, Georgia Tech", "x1": -0.27735481471855816, "y1": -0.18024313605250375, "x2": -0.2409558021969594, "y2": -0.17018759470512965, "x3": -0.22321366355899516, "y3": -0.14173955724204357, "x4": -0.2361498946764468, "y4": -0.06706179229368028, "x5": -0.23279062695650063, "y5": -0.006645287546324948}, {"x0": -0.008030000974038663, "y0": 0.12903203417253636, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 2, "grouping6": 4, "Author": "Srinivas Aluru", "URL": "https://scholar.google.com/citations?user=YOGOScoAAAAJ", "KeyWords": "Bioinformatics, High performance Computing, Parallel Algorithms and Applications, Systems Biology", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=YOGOScoAAAAJ", "Citations": "10747", "Affiliation": "Georgia Institute of Technology", "x1": 0.06904070389147922, "y1": 0.2441085104543989, "x2": 0.14352109308370092, "y2": 0.26412918989559886, "x3": 0.20136551887846846, "y3": 0.24265283635891105, "x4": 0.2727323173450225, "y4": 0.16137180354880948, "x5": 0.30567857075759897, "y5": 0.07801382660546007}, {"x0": -0.13169294280574395, "y0": -0.04839339110334068, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "David V. Anderson", "URL": "https://scholar.google.com/citations?user=b9_uwfcAAAAJ", "KeyWords": "", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=b9_uwfcAAAAJ", "Citations": "3754", "Affiliation": "Georgia Tech", "x1": 0.029224522133008406, "y1": 0.07541005419902698, "x2": 0.13451422579010955, "y2": 0.1550693162024771, "x3": 0.21711785650868018, "y3": 0.2110545144391778, "x4": 0.3258600554031897, "y4": 0.17491478572259836, "x5": 0.4046716629696841, "y5": 0.10160099386604492}, {"x0": -0.23621595935603848, "y0": 0.13503138482621851, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 0, "grouping5": 1, "grouping6": 0, "Author": "Manos Antonakakis", "URL": "https://scholar.google.com/citations?user=P6VJcVIAAAAJ", "KeyWords": "Computer and Network Security", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=P6VJcVIAAAAJ", "Citations": "3451", "Affiliation": "Georgia Institute of Technology", "x1": -0.10802153490735428, "y1": 0.25034738168163245, "x2": -0.012276190895829018, "y2": 0.25128715739208635, "x3": 0.05702046797358273, "y3": 0.23816886305393567, "x4": 0.14532886497718622, "y4": 0.19993978894227657, "x5": 0.20106930290967945, "y5": 0.1465820349332559}, {"x0": -0.18792493989328773, "y0": 0.24576586761191707, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 0, "grouping5": 1, "grouping6": 0, "Author": "Ronald C. Arkin", "URL": "https://scholar.google.com/citations?user=WSN7T_YAAAAJ", "KeyWords": "artificial intelligence, robotics, robot ethics, autonomous agents", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=WSN7T_YAAAAJ", "Citations": "28777", "Affiliation": "Regents Professor of Computer Science, Georgia Tech", "x1": -0.3508445784676642, "y1": 0.3582177020639637, "x2": -0.43576594437469707, "y2": 0.4211772417511833, "x3": -0.42254953821766106, "y3": 0.4779123523539831, "x4": -0.26374208278024647, "y4": 0.584739243525131, "x5": -0.10181964169210102, "y5": 0.6327748624266426}, {"x0": -0.07309221653117598, "y0": 0.2937436741296099, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 4, "Author": "Matthieu Bloch", "URL": "https://scholar.google.com/citations?user=cglpZYQAAAAJ", "KeyWords": "Information theory, coding theory, wireless communications", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=cglpZYQAAAAJ", "Citations": "5744", "Affiliation": "Associate Professor of Electrical and Computer Engineering, Georgia Tech", "x1": 0.05466573895259223, "y1": 0.2594264894420054, "x2": 0.10955826592551252, "y2": 0.22533120503625098, "x3": 0.14891113251285917, "y3": 0.1924954319449128, "x4": 0.20684276504351948, "y4": 0.12624444598015966, "x5": 0.2335854574615162, "y5": 0.05626875814338088}, {"x0": -0.29134858163915334, "y0": -0.19271943015899937, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 0, "Author": "Duen Horng “Polo” Chau", "URL": "https://scholar.google.com/citations?user=YON32W4AAAAJ", "KeyWords": "AI Security, Explainable AI, Visual Analytics, Adversarial Machine Learning, Graph Visualization", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=YON32W4AAAAJ", "Citations": "4333", "Affiliation": "Professor of Computer Science, Georgia Tech", "x1": -0.22682640902725587, "y1": -0.09424466200401048, "x2": -0.149549624641333, "y2": -0.06124933415647964, "x3": -0.10650455696239461, "y3": -0.04014286411069845, "x4": -0.08922029729510116, "y4": -0.008422015121342517, "x5": -0.07420704695435795, "y5": 0.01062781800808131}, {"x0": 0.33288033808377687, "y0": -0.03579044693854443, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 0, "grouping6": 2, "Author": "Yongxin Chen", "URL": "https://scholar.google.com/citations?user=X8BYiV4AAAAJ", "KeyWords": "control theory, optimal mass transport, machine learning, robotics, optimization", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=X8BYiV4AAAAJ", "Citations": "819", "Affiliation": "Assistant Professor", "x1": 0.17018961216312659, "y1": -0.05270742783863405, "x2": 0.03480026581223683, "y2": -0.03803551695105868, "x3": -0.025070240264887255, "y3": -0.025437303659992565, "x4": -0.05630561457777928, "y4": -0.006215077002256009, "x5": -0.06635593873856803, "y5": 0.01585415025469197}, {"x0": 0.07881312340903106, "y0": 0.11452857913882387, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 5, "Author": "Rachel Cummings", "URL": "https://scholar.google.com/citations?user=2mYxmokAAAAJ", "KeyWords": "Data privacy, Machine learning, Algorithmic economics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=2mYxmokAAAAJ", "Citations": "636", "Affiliation": "Georgia Institute of Technology", "x1": 0.059433394223381744, "y1": 0.043435195983597026, "x2": 0.060116384739670764, "y2": 0.00856149908246111, "x3": 0.05297654730823681, "y3": -0.01640382978874569, "x4": 0.03293378167561816, "y4": -0.04248077861222154, "x5": 0.010102030980429734, "y5": -0.05421889029363775}, {"x0": 0.06845024882018039, "y0": -0.10198024665424595, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Mark A. Davenport", "URL": "https://scholar.google.com/citations?user=DpuKx_oAAAAJ", "KeyWords": "Signal processing, Statistical inference, Machine learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=DpuKx_oAAAAJ", "Citations": "11424", "Affiliation": "Associate Professor of Electrical & Computer Engineering, Georgia Institute of Technology", "x1": 0.11182018295027263, "y1": -0.3126794491007254, "x2": 0.1091122945389423, "y2": -0.400194603891708, "x3": 0.059220415964996255, "y3": -0.45550814513013355, "x4": -0.0905451623031961, "y4": -0.4741962683691892, "x5": -0.22244697579211353, "y5": -0.4455679196218684}, {"x0": -0.10343651473496454, "y0": 0.03514192357188354, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Constantine Dovrolis", "URL": "https://scholar.google.com/citations?user=sfuwsSwAAAAJ", "KeyWords": "Networks", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=sfuwsSwAAAAJ", "Citations": "13720", "Affiliation": "Professor of Computer Science, Georgia Tech", "x1": 0.009136267538009491, "y1": 0.13315543432871593, "x2": 0.08344047720508842, "y2": 0.13443712979292866, "x3": 0.13111723185617585, "y3": 0.12430442145276903, "x4": 0.1767763021169698, "y4": 0.07520726534279701, "x5": 0.19934583035439993, "y5": 0.02327637605076367}, {"x0": -0.00859045882440722, "y0": -0.11577889998392843, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Eva L. Dyer", "URL": "https://scholar.google.com/citations?user=Sb_jcHcAAAAJ", "KeyWords": "Computational Neuroscience, Machine Learning, Signal Processing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Sb_jcHcAAAAJ", "Citations": "385", "Affiliation": "Assistant Professor at Georgia Institute of Technology", "x1": 0.011654379173382542, "y1": -0.2707149537347604, "x2": 0.01345464541758682, "y2": -0.33501141065597256, "x3": -0.024822557962423695, "y3": -0.3624399126790631, "x4": -0.13170936169675632, "y4": -0.3379116198597366, "x5": -0.21761886546693984, "y5": -0.2931483755846351}, {"x0": -0.3080709224984123, "y0": -0.046308708970279396, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 0, "Author": "Irfan Essa", "URL": "https://scholar.google.com/citations?user=XM97iScAAAAJ", "KeyWords": "Computer Vision, Computer Graphics, Machine Learning, Artificial Intelligence, Robotics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=XM97iScAAAAJ", "Citations": "17256", "Affiliation": "Distinguished Professor of Computing, Georgia Tech , Research Scientist, Google", "x1": -0.42553075904892185, "y1": -0.009499923443379644, "x2": -0.490219192746792, "y2": 0.037824347183997416, "x3": -0.4977784520109759, "y3": 0.10644995561088882, "x4": -0.4451044404689406, "y4": 0.26593268733281605, "x5": -0.36054235788575933, "y5": 0.38604433368830365}, {"x0": 0.006642491287688781, "y0": -0.09790485699777174, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Faramarz Fekri", "URL": "https://scholar.google.com/citations?user=sB1XU4kAAAAJ", "KeyWords": "Information Theory, Graphical Models, Reinforcement Learning, Biology, Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=sB1XU4kAAAAJ", "Citations": "4473", "Affiliation": "Georgia Tech", "x1": -0.025163546071734502, "y1": -0.21040821420146893, "x2": -0.03152176433640775, "y2": -0.21703561068355104, "x3": -0.045403250111027325, "y3": -0.21077951451354007, "x4": -0.10583201343776295, "y4": -0.1857442878862816, "x5": -0.14734029217357594, "y5": -0.1502774535488578}, {"x0": 0.03293693024759412, "y0": 0.1211460273844073, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 1, "grouping5": 2, "grouping6": 5, "Author": "Nagi Gebraeel", "URL": "https://scholar.google.com/citations?user=hL8pnrMAAAAJ", "KeyWords": "Prognostics, Condition monitoring, Reliability", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=hL8pnrMAAAAJ", "Citations": "3444", "Affiliation": "Georgia Institute of Technology", "x1": 0.11387817847205735, "y1": 0.1817542402664812, "x2": 0.14994184073908637, "y2": 0.1808630550168304, "x3": 0.177340384661944, "y3": 0.1695678396144219, "x4": 0.22594168030961173, "y4": 0.11226661313222451, "x5": 0.24915134365251243, "y5": 0.04461627663910805}, {"x0": -0.3116575573709343, "y0": -0.26146110553452395, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 0, "Author": "James Hays", "URL": "https://scholar.google.com/citations?user=vjZrDKQAAAAJ", "KeyWords": "Computer Vision, Robotics, Machine Learning, AI", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=vjZrDKQAAAAJ", "Citations": "19267", "Affiliation": "Georgia Tech", "x1": -0.3804514136286595, "y1": -0.16260179878456915, "x2": -0.42306165758609954, "y2": -0.10759552072634795, "x3": -0.45507718671733594, "y3": -0.04228902175182378, "x4": -0.46115039024902865, "y4": 0.11774348738366447, "x5": -0.41824505990808175, "y5": 0.25384263931926204}, {"x0": -0.29906227644757644, "y0": -0.36483986785351247, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 0, "Author": "Judy Hoffman", "URL": "https://scholar.google.com/citations?user=mqpjAt4AAAAJ", "KeyWords": "Artificial Intelligence, Computer Vision, Deep Learning, Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=mqpjAt4AAAAJ", "Citations": "9402", "Affiliation": "Assistant Professor, Georgia Tech", "x1": -0.3942202066495329, "y1": -0.280626324604193, "x2": -0.44104821756131085, "y2": -0.21564065279800385, "x3": -0.4750415800008162, "y3": -0.13435932425315394, "x4": -0.49546248653953956, "y4": 0.038547532373372446, "x5": -0.46339355657062714, "y5": 0.18497143953883516}, {"x0": 0.28801811815181655, "y0": -0.10304386954257792, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 3, "grouping5": 0, "grouping6": 2, "Author": "Xiaoming Huo", "URL": "https://scholar.google.com/citations?user=YNQLrPgAAAAJ", "KeyWords": "statistics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=YNQLrPgAAAAJ", "Citations": "5201", "Affiliation": "Professor, Georgia Institute of Technology", "x1": 0.32664034064518876, "y1": -0.10570011813839605, "x2": 0.3199127104914513, "y2": -0.1216095050328767, "x3": 0.3003238882273341, "y3": -0.15976811057994628, "x4": 0.2339855398212517, "y4": -0.25711388623061376, "x5": 0.15289810350076236, "y5": -0.31853053786573887}, {"x0": -0.2587849655729021, "y0": -0.3880362823866486, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 0, "grouping5": 3, "grouping6": 3, "Author": "Zsolt Kira", "URL": "https://scholar.google.com/citations?user=2a5XgNAAAAAJ", "KeyWords": "Machine Learning, Perception, Robotics, Artificial Intelligence", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=2a5XgNAAAAAJ", "Citations": "1068", "Affiliation": "Assistant Professor, Georgia Institute of Technology", "x1": -0.4438889264086634, "y1": -0.20062025250437052, "x2": -0.5436577918235751, "y2": -0.08553732489800403, "x3": -0.5806113176660901, "y3": 0.016911549326422082, "x4": -0.5529782983348216, "y4": 0.20589449026384707, "x5": -0.47600852897210927, "y5": 0.35470633362613285}, {"x0": 0.5552754836503367, "y0": 0.025358119396535747, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 1, "Author": "Guanghui (George) Lan", "URL": "https://scholar.google.com/citations?user=l3SflUcAAAAJ", "KeyWords": "Mathematical Optimization, Stochastic Programming, Nonlinear Programming, Machine Learning, Image Processing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=l3SflUcAAAAJ", "Citations": "4992", "Affiliation": "Georgia Institute of Technology", "x1": 0.46720355696985494, "y1": -0.08555939921084052, "x2": 0.36292458457251026, "y2": -0.0887536686635993, "x3": 0.2967914371005432, "y3": -0.11541375837841232, "x4": 0.22218813608993962, "y4": -0.19227289029614358, "x5": 0.15055233183410283, "y5": -0.23581876856334946}, {"x0": 0.2395174205577575, "y0": 0.12500177487433825, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 2, "Author": "Siva Theja Maguluri", "URL": "https://scholar.google.com/citations?user=Y4e61JcAAAAJ", "KeyWords": "Applied Probability, Optimization, Reinforcement Learning, Resource Allocation Algorithms, Networks", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Y4e61JcAAAAJ", "Citations": "670", "Affiliation": "Georgia Institute of Technology", "x1": 0.2569057732074887, "y1": 0.06224526733049565, "x2": 0.23609920784816502, "y2": 0.04003233448068546, "x3": 0.22279486614412417, "y3": 0.0131650378929399, "x4": 0.20322854198249754, "y4": -0.05703916351898903, "x5": 0.1731678137053108, "y5": -0.107635549904442}, {"x0": -0.18269842127181984, "y0": 0.564885092215855, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 4, "Author": "Cassie S. Mitchell", "URL": "https://scholar.google.com/citations?user=FpxAYrgAAAAJ", "KeyWords": "Predictive Medicine, Big Data, Machine Learning, ALS, Alzheimers", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=FpxAYrgAAAAJ", "Citations": "488", "Affiliation": "Georgia Institute of Technology", "x1": -0.03439128580266072, "y1": 0.39331698834591344, "x2": 0.03819499199499364, "y2": 0.2768713831169517, "x3": 0.07888077824687163, "y3": 0.20232785959322452, "x4": 0.13260574651126147, "y4": 0.13854009827813255, "x5": 0.15712806766974108, "y5": 0.08051520689222919}, {"x0": -0.10016016283521886, "y0": 0.2967580085320486, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 4, "Author": "Benoit Montreuil", "URL": "https://scholar.google.com/citations?user=fLLmxRsAAAAJ", "KeyWords": "layout, physical Internet, logistics, business design, networked manufacturing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=fLLmxRsAAAAJ", "Citations": "5586", "Affiliation": "Professor, School of Industrial and Systems Engineering, Georgia Institute of Technology, Atlanta", "x1": -0.009273184941567947, "y1": 0.39534004348493446, "x2": 0.06362398908809079, "y2": 0.3662470855075916, "x3": 0.12852491618199008, "y3": 0.3302142789444585, "x4": 0.23212281801248613, "y4": 0.25337204576823347, "x5": 0.29236902238827756, "y5": 0.1659302651383608}, {"x0": -0.1444255668106601, "y0": 0.017351831781788975, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Saibal Mukhopadhyay", "URL": "https://scholar.google.com/citations?user=5KRtMEkAAAAJ", "KeyWords": "Circuit design, low power", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=5KRtMEkAAAAJ", "Citations": "10201", "Affiliation": "Professor of Electrical Engineering, Georgia Institute of Technology", "x1": -0.05197595761012872, "y1": 0.15105764731844934, "x2": 0.02202475903399226, "y2": 0.17604397717365966, "x3": 0.0777486692920693, "y3": 0.18372486841208846, "x4": 0.15127561406902695, "y4": 0.1526433505728532, "x5": 0.2015895775253113, "y5": 0.10425795523890502}, {"x0": 0.503791066138971, "y0": 0.0036928205305992567, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 1, "Author": "Arkadi Nemirovski", "URL": "https://scholar.google.com/citations?user=3QxoymwAAAAJ", "KeyWords": "optimization, operations research, convex optimization, nonparametric statistics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=3QxoymwAAAAJ", "Citations": "45657", "Affiliation": "Professor and Jh. Hunter  Academic Chair, School of Industrial and Systems Engineering, Georgia", "x1": 0.5212771193966478, "y1": -0.0461986862146906, "x2": 0.45270926437186665, "y2": -0.04352875350010865, "x3": 0.40363900978967654, "y3": -0.06679197125308459, "x4": 0.34822534505734815, "y4": -0.17611009039098505, "x5": 0.28244075194772184, "y5": -0.2527031208544924}, {"x0": -0.1892077903206822, "y0": 0.2224794249337853, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 0, "grouping5": 1, "grouping6": 0, "Author": "Chethan Pandarinath", "URL": "https://scholar.google.com/citations?user=M3-z9G4AAAAJ", "KeyWords": "neuroengineering, brain-machine interfaces, systems neuroscience, motor control, deep learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=M3-z9G4AAAAJ", "Citations": "1376", "Affiliation": "Asst. Prof. of Biomedical Engineering, Emory University and Georgia Tech", "x1": -0.11973401299942833, "y1": 0.01778255035111984, "x2": -0.06089836255479534, "y2": -0.05878368794294854, "x3": -0.03846307379582335, "y3": -0.08558313226692316, "x4": -0.04809507203945109, "y4": -0.08117313640564042, "x5": -0.06147564425126042, "y5": -0.07625107962766996}, {"x0": -0.02516184368654819, "y0": -0.023581944168597668, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Haesun Park", "URL": "https://scholar.google.com/citations?user=G6kA1CMAAAAJ", "KeyWords": "Numerical Algorithms, Data Analysis, Visual Analytics, Parallel Computing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=G6kA1CMAAAAJ", "Citations": "18227", "Affiliation": "Regents Professor of Computational Science and Engineering, Georgia Institute of Technology", "x1": 0.027351042508516252, "y1": 0.09350076834521384, "x2": 0.08776462370854173, "y2": 0.13742045816346826, "x3": 0.1347135618783578, "y3": 0.14045176690832567, "x4": 0.18316058770777713, "y4": 0.0952034512158885, "x5": 0.20637344988515682, "y5": 0.04442444766690568}, {"x0": -0.262276251006364, "y0": 0.042934611993155285, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 0, "grouping5": 4, "grouping6": 0, "Author": "Thomas Ploetz", "URL": "https://scholar.google.com/citations?user=kM95eWgAAAAJ", "KeyWords": "Computational Behavior Analysis, Activity Recognition, Ubiquitous Computing, Health, Applied Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=kM95eWgAAAAJ", "Citations": "4440", "Affiliation": "Georgia Institute of Technology", "x1": -0.18822793694354747, "y1": 0.022146162849819535, "x2": -0.1221763047185252, "y2": 0.025016539835266846, "x3": -0.08773691353051402, "y3": 0.02502432483623492, "x4": -0.06448988520214567, "y4": 0.04318487255244373, "x5": -0.04775885092487516, "y5": 0.052870694952474095}, {"x0": -0.15654839693292588, "y0": 0.45011501565582596, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 2, "grouping5": 1, "grouping6": 4, "Author": "Peng Qiu", "URL": "https://scholar.google.com/citations?user=huPJapcAAAAJ", "KeyWords": "Bioinformatics and Computational Biology", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=huPJapcAAAAJ", "Citations": "5419", "Affiliation": "Georgia Institute of Technology", "x1": 0.005559637680397522, "y1": 0.407742376668444, "x2": 0.10580175758925202, "y2": 0.36416045886665166, "x3": 0.17435060165302457, "y3": 0.32374319427563963, "x4": 0.2696572554206615, "y4": 0.2410838497117631, "x5": 0.32268220462133385, "y5": 0.15221364889256614}, {"x0": -0.1769029303762072, "y0": -0.07555082634859467, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Mark Riedl", "URL": "https://scholar.google.com/citations?user=Yg_QjxcAAAAJ", "KeyWords": "Artificial intelligence, Machine Learning, Storytelling, Game AI, Computer Games", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Yg_QjxcAAAAJ", "Citations": "5569", "Affiliation": "Associate Professor of Interactive Computing, Georgia Institute of Technology", "x1": -0.2606185140705505, "y1": -0.005162412099716548, "x2": -0.28228932501108317, "y2": 0.028998698557367912, "x3": -0.2783379942224112, "y3": 0.0724699199197041, "x4": -0.23939050162733824, "y4": 0.16008921743915894, "x5": -0.18536077460328096, "y5": 0.21992052307962245}, {"x0": 0.03116676566661854, "y0": -0.10855036914788503, "grouping1": 0, "grouping2": 1, "grouping3": 0, "grouping4": 3, "grouping5": 4, "grouping6": 5, "Author": "Christopher Rozell", "URL": "https://scholar.google.com/citations?user=JHuo2D0AAAAJ", "KeyWords": "Computational neuroscience, Neuroengineering, Machine learning, Signal processing, Brain-machine interfaces", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=JHuo2D0AAAAJ", "Citations": "2228", "Affiliation": "Professor of Electrical and Computer Engineering, Georgia Institute of Technology", "x1": -0.014167387520775399, "y1": -0.2090129144461163, "x2": -0.001125066080202182, "y2": -0.259636828078778, "x3": -0.013502774626991874, "y3": -0.28227346020880506, "x4": -0.09234726087015456, "y4": -0.26974545952467105, "x5": -0.15768680813302977, "y5": -0.23973715844522392}, {"x0": 0.019206890341603992, "y0": -0.35307895728243016, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 2, "grouping5": 0, "grouping6": 3, "Author": "Le Song", "URL": "https://scholar.google.com/citations?user=Xl4E0CsAAAAJ", "KeyWords": "Machine Learning", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=Xl4E0CsAAAAJ", "Citations": "11652", "Affiliation": "Georgia Institute of Technology", "x1": -0.03335194775874122, "y1": -0.3779986375897095, "x2": -0.06280795617264778, "y2": -0.3909176614930298, "x3": -0.11806842223871299, "y3": -0.3937409312125143, "x4": -0.2552143378944385, "y4": -0.3450462456952229, "x5": -0.35834159929568304, "y5": -0.26402826103654703}, {"x0": 0.23610119709432364, "y0": -0.10764153829405419, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 3, "grouping5": 0, "grouping6": 2, "Author": "Evangelos Theodorou", "URL": "https://scholar.google.com/citations?user=dG9MV7oAAAAJ", "KeyWords": "Stochastic Control Theory, Machine Learning, Statistical Physics", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=dG9MV7oAAAAJ", "Citations": "3885", "Affiliation": "Georgia Institute of Technology", "x1": 0.16592293952361833, "y1": -0.14011592185788835, "x2": 0.10267937008401289, "y2": -0.17270619747117155, "x3": 0.05743572686273634, "y3": -0.2008494942195277, "x4": -0.014966277701523473, "y4": -0.2182942933113746, "x5": -0.08105249136442792, "y5": -0.21413790796995144}, {"x0": 0.22839907980825555, "y0": 0.048185136581410055, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 2, "Author": "Panagiotis Tsiotras", "URL": "https://scholar.google.com/citations?user=qmVayjgAAAAJ", "KeyWords": "controls, robotics, artificial intelligence, flying robots, spacecraft", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=qmVayjgAAAAJ", "Citations": "11415", "Affiliation": "Georgia Institute of Technology", "x1": -0.15940828800924559, "y1": 0.253939896524941, "x2": -0.31530424278104957, "y2": 0.34087094703671106, "x3": -0.34207730441043216, "y3": 0.40603854148329754, "x4": -0.21891137756960982, "y4": 0.5039199850812454, "x5": -0.08357849830523617, "y5": 0.551558400881134}, {"x0": 0.11463908254034769, "y0": 0.08081948628344883, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 5, "Author": "Pascal Van Hentenryck", "URL": "https://scholar.google.com/citations?user=GxFQz-4AAAAJ", "KeyWords": "Artificial Intelligence, Data Science, Operations Research, Mobility, Energy", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=GxFQz-4AAAAJ", "Citations": "20067", "Affiliation": "Georgia Institute of Technology", "x1": 0.07458447603440138, "y1": 0.12688190669056368, "x2": 0.03023220701100056, "y2": 0.157805635489516, "x3": 0.007383692755916587, "y3": 0.18185611784695135, "x4": 0.04810489010009253, "y4": 0.183206657616651, "x5": 0.08978828639374853, "y5": 0.17248631611834012}, {"x0": 0.2702424210143644, "y0": 0.09218717451386886, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 2, "grouping6": 2, "Author": "Santosh S. Vempala", "URL": "https://scholar.google.com/citations?user=hRggMmIAAAAJ", "KeyWords": "Algorithms, Randomness, High-dimensional Geometry, Optimization, Foundations of Data Science", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=hRggMmIAAAAJ", "Citations": "15165", "Affiliation": "Georgia Tech", "x1": 0.3133437002029693, "y1": 0.06878716322714272, "x2": 0.31068744291746114, "y2": 0.0725105130513103, "x3": 0.30658051035732353, "y3": 0.05322661236082714, "x4": 0.30127805405136193, "y4": -0.03651752839249243, "x5": 0.2766805580217366, "y5": -0.109375678748869}, {"x0": 0.17279137572145106, "y0": -0.11710081151871225, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 3, "grouping5": 0, "grouping6": 5, "Author": "Yao C. Xie", "URL": "https://scholar.google.com/citations?user=qvYp8ZQAAAAJ", "KeyWords": "signal processing, statistics, machine learning.", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=qvYp8ZQAAAAJ", "Citations": "2006", "Affiliation": "Associate Professor, Nash Early Career Professor, Georgia Institute of Technology", "x1": 0.21490217475117643, "y1": -0.28455383900942094, "x2": 0.19503449497313666, "y2": -0.3693996377097566, "x3": 0.13341151969696555, "y3": -0.43680336900898736, "x4": -0.029967086443012027, "y4": -0.48586955099863793, "x5": -0.17352180249141386, "y5": -0.47372617374472237}, {"x0": -0.20127972277247982, "y0": 0.16953764152010833, "grouping1": 0, "grouping2": 1, "grouping3": 2, "grouping4": 0, "grouping5": 1, "grouping6": 0, "Author": "Diyi Yang", "URL": "https://scholar.google.com/citations?user=j9jhYqQAAAAJ", "KeyWords": "Natural Language Processing, Computational Social Science, Social Computing, Machine Learning, Educational Data Mining", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=j9jhYqQAAAAJ", "Citations": "3850", "Affiliation": "Georgia Tech", "x1": -0.11670054673393263, "y1": 0.035083505688699765, "x2": -0.05814139287585201, "y2": -0.00023087958716854994, "x3": -0.03571663780145899, "y3": -0.02037134746420656, "x4": -0.03122912932193306, "y4": -0.018594546214209886, "x5": -0.03350267800025655, "y5": -0.01757184151342875}, {"x0": 0.0241345461036084, "y0": -0.35721790944042475, "grouping1": 0, "grouping2": 0, "grouping3": 0, "grouping4": 2, "grouping5": 0, "grouping6": 3, "Author": "Hongyuan Zha 査宏远", "URL": "https://scholar.google.com/citations?user=tqEWl8gAAAAJ", "KeyWords": "Machine learning applications", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=tqEWl8gAAAAJ", "Citations": "22131", "Affiliation": "College of Computing, Georgia Institute of Technology", "x1": -0.034124783315334764, "y1": -0.4062316729971377, "x2": -0.06939294969913962, "y2": -0.4198223385601917, "x3": -0.12662591281014016, "y3": -0.4178287990510226, "x4": -0.26524598376377223, "y4": -0.36081061578824375, "x5": -0.36534113089882303, "y5": -0.27373796081863916}, {"x0": 0.32987347362367514, "y0": -0.2532836760890358, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 3, "grouping5": 0, "grouping6": 2, "Author": "Tuo Zhao", "URL": "https://scholar.google.com/citations?user=EJXN6tYAAAAJ", "KeyWords": "Machine Learning, Nonconvex Optimization, Statistics, Natural Language Processing", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=EJXN6tYAAAAJ", "Citations": "2971", "Affiliation": "Assistant Professor, Georgia Tech", "x1": 0.2802037998488689, "y1": -0.3034732054210375, "x2": 0.21839799972793278, "y2": -0.31736588438680696, "x3": 0.15520554654959706, "y3": -0.3390024528561899, "x4": 0.031037367485543806, "y4": -0.36977524189353256, "x5": -0.07394217810058169, "y5": -0.3624176000367816}, {"x0": 0.3724576658952688, "y0": 0.14920746922363656, "grouping1": 0, "grouping2": 1, "grouping3": 1, "grouping4": 1, "grouping5": 0, "grouping6": 1, "Author": "Enlu Zhou", "URL": "https://scholar.google.com/citations?user=LTKmex0AAAAJ", "KeyWords": "", "PictureURL": "https://scholar.google.com/citations?view_op=medium_photo&user=LTKmex0AAAAJ", "Citations": "697", "Affiliation": "Associate Professor, School of Industrial and Systems Engineering, Georgia Institute of Technology", "x1": 0.3713384943678204, "y1": 0.16467366400801137, "x2": 0.3556448893919567, "y2": 0.208584439259696, "x3": 0.37374709650761856, "y3": 0.23576601299970287, "x4": 0.44477129161263235, "y4": 0.15634881602139503, "x5": 0.4930569809005767, "y5": 0.06217226376467893}];

    var citedRankData = {"machine learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}]}, "artificial intelligence": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "robotics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "signal processing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "statistics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "computer vision": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "visual analytics": {3: [{"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "reinforcement learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}]}, "operations research": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "neuroengineering": {3: [{"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "networks": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "natural language processing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 2}, {"rank": 1}, {"rank": -1}, {"rank": 0}, {"rank": -1}]}, "information theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}]}, "deep learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}]}, "computational neuroscience": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "brain-machine interfaces": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}]}, "wireless communications": {3: [{"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "ubiquitous computing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "systems neuroscience": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "systems biology": {3: [{"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "storytelling": {3: [{"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "stochastic programming": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}]}, "stochastic control theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "statistical physics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "statistical inference": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "spacecraft": {3: [{"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "social computing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "robot ethics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "resource allocation algorithms": {3: [{"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "reliability": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "randomness": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "prognostics": {3: [{"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "predictive medicine": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "physical internet": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "perception and scene understanding": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "perception": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "parallel computing": {3: [{"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "parallel algorithms and applications": {3: [{"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "optimal mass transport": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "numerical algorithms": {3: [{"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "nonparametric statistics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}]}, "nonlinear programming": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "nonconvex optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}]}, "networked manufacturing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "motor control": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "mobility": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "mathematical optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "machine learning applications": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}]}, "machine": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}]}, "low power": {3: [{"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "logistics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}]}, "layout": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "image processing": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "image and video processing": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "high-dimensional geometry": {3: [{"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 2}, {"rank": -1}]}, "high performance computing": {3: [{"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "health": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "graphical models": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 0}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "graph visualization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}]}, "game ai": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "foundations of data science": {3: [{"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "flying robots": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "explainable ai": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "energy": {3: [{"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "educational data mining": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "data science": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "data privacy": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 3}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "data analysis": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "convex optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "controls": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "control theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "condition monitoring": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computer graphics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computer games": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computer and network security": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computational social science": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 3}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computational seismic interpretation": {3: [{"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computational behavior analysis": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "coding theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "circuit design": {3: [{"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 0}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "business design": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}]}, "biology": {3: [{"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "bioinformatics and computational biology": {3: [{"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "bioinformatics": {3: [{"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "big data": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "autonomous agents": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "applied probability": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "applied machine learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}]}, "alzheimers": {3: [{"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "als": {3: [{"rank": 0}, {"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "algorithms": {3: [{"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "algorithmic economics": {3: [{"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "ai security": {3: [{"rank": 0}, {"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "ai": {3: [{"rank": 0}, {"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "adversarial machine learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}]}, "activity recognition": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}};

    var recentRankData = {"machine learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}]}, "artificial intelligence": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "robotics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "signal processing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "statistics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}]}, "computer vision": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "visual analytics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}]}, "reinforcement learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}]}, "operations research": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "neuroengineering": {3: [{"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "networks": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "natural language processing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 0}, {"rank": -1}, {"rank": 1}, {"rank": -1}]}, "information theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}]}, "deep learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}]}, "computational neuroscience": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "brain-machine interfaces": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "wireless communications": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "ubiquitous computing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "systems neuroscience": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "systems biology": {3: [{"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "storytelling": {3: [{"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "stochastic programming": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}]}, "stochastic control theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "statistical physics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "statistical inference": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "spacecraft": {3: [{"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "social computing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "robot ethics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "resource allocation algorithms": {3: [{"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "reliability": {3: [{"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "randomness": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "prognostics": {3: [{"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "predictive medicine": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}]}, "physical internet": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "perception and scene understanding": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "perception": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "parallel computing": {3: [{"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "parallel algorithms and applications": {3: [{"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "optimal mass transport": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "numerical algorithms": {3: [{"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "nonparametric statistics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}]}, "nonlinear programming": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "nonconvex optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}]}, "networked manufacturing": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "motor control": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "mobility": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "mathematical optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}]}, "machine learning applications": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}]}, "machine": {3: [{"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}]}, "low power": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "logistics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 2}]}, "layout": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "image processing": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "image and video processing": {3: [{"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "high-dimensional geometry": {3: [{"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}]}, "high performance computing": {3: [{"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "health": {3: [{"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "graphical models": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}]}, "graph visualization": {3: [{"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}]}, "game ai": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "foundations of data science": {3: [{"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "flying robots": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "explainable ai": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}]}, "energy": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "educational data mining": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "data science": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 2}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "data privacy": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "data analysis": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "convex optimization": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}]}, "controls": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "control theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "condition monitoring": {3: [{"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computer graphics": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computer games": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computer and network security": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computational social science": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": 1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computational seismic interpretation": {3: [{"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "computational behavior analysis": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "coding theory": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "circuit design": {3: [{"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 0}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "business design": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}]}, "biology": {3: [{"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "bioinformatics and computational biology": {3: [{"rank": 3}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "bioinformatics": {3: [{"rank": 3}, {"rank": 1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "big data": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "autonomous agents": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}]}, "applied probability": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}]}, "applied machine learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}]}, "alzheimers": {3: [{"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "als": {3: [{"rank": 0}, {"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "algorithms": {3: [{"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "algorithmic economics": {3: [{"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "ai security": {3: [{"rank": 0}, {"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "ai": {3: [{"rank": 0}, {"rank": 1}, {"rank": 2}, {"rank": 3}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}, "adversarial machine learning": {3: [{"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}]}, "activity recognition": {3: [{"rank": -1}, {"rank": -1}, {"rank": 1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 3}, {"rank": -1}, {"rank": -1}, {"rank": 4}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 2}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": 0}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}, {"rank": -1}]}};

    var citedClusters = [{"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 5, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 5, "grouping6,5": 5, "grouping6,6": 0, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 5}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 2, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 3, "grouping4,10": 2, "grouping5,1": 2, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 2, "grouping5,7": 2, "grouping5,8": 2, "grouping5,9": 0, "grouping5,10": 4, "grouping6,1": 2, "grouping6,2": 2, "grouping6,3": 2, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 2, "grouping6,7": 0, "grouping6,8": 3, "grouping6,9": 2, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 0, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 0, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 3, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 0, "grouping4,10": 1, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 1, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 1, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 1, "grouping5,4": 0, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 4, "grouping5,8": 4, "grouping5,9": 0, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 0, "grouping6,5": 0, "grouping6,6": 4, "grouping6,7": 4, "grouping6,8": 1, "grouping6,9": 3, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 0, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 0, "grouping4,10": 1, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 1, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 1, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 1, "grouping5,4": 0, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 4, "grouping5,8": 4, "grouping5,9": 0, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 0, "grouping6,5": 0, "grouping6,6": 4, "grouping6,7": 4, "grouping6,8": 1, "grouping6,9": 3, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 1, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 1, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 1, "grouping5,4": 0, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 4, "grouping5,8": 4, "grouping5,9": 0, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 0, "grouping6,5": 0, "grouping6,6": 4, "grouping6,7": 4, "grouping6,8": 1, "grouping6,9": 3, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 3, "grouping4,3": 0, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 0, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 1, "grouping6,5": 3, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 5, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 1, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 1, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 1, "grouping5,4": 0, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 4, "grouping5,8": 4, "grouping5,9": 0, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 0, "grouping6,5": 0, "grouping6,6": 4, "grouping6,7": 4, "grouping6,8": 1, "grouping6,9": 3, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 3, "grouping4,3": 0, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 0, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 1, "grouping6,5": 3, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 5, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 0, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 1, "grouping5,1": 1, "grouping5,2": 0, "grouping5,3": 0, "grouping5,4": 4, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 3, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 5, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 2, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 0, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 0, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 0, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 3, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 5, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 0, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 4, "grouping5,8": 2, "grouping5,9": 0, "grouping5,10": 4, "grouping6,1": 0, "grouping6,2": 3, "grouping6,3": 2, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 5, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 3, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 2, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 3, "grouping4,10": 2, "grouping5,1": 2, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 2, "grouping5,7": 2, "grouping5,8": 2, "grouping5,9": 0, "grouping5,10": 4, "grouping6,1": 2, "grouping6,2": 2, "grouping6,3": 2, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 2, "grouping6,7": 0, "grouping6,8": 3, "grouping6,9": 2, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 1, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 1, "grouping3,10": 1, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 3, "grouping4,4": 1, "grouping4,5": 2, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 1, "grouping4,9": 3, "grouping4,10": 3, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 2, "grouping5,7": 2, "grouping5,8": 2, "grouping5,9": 0, "grouping5,10": 4, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 2, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 3, "grouping6,9": 2, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 2, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 0, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 1, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 2, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 1, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 4, "grouping6,9": 1, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 0, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 0, "grouping5,9": 3, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 1, "grouping6,7": 5, "grouping6,8": 0, "grouping6,9": 4, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 0, "grouping3,7": 2, "grouping3,8": 0, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 0, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 1, "grouping5,1": 0, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 1, "grouping6,7": 2, "grouping6,8": 2, "grouping6,9": 0, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 2, "grouping3,9": 0, "grouping3,10": 0, "grouping4,1": 3, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 2, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 0, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 0, "grouping5,4": 1, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 0, "grouping5,8": 1, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 3, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 5, "grouping6,5": 5, "grouping6,6": 0, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 1, "grouping6,10": 5}];

    var recentClusters = [{"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 2, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 0, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 3, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 5, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 0, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 4, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 0, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 2, "grouping3,8": 2, "grouping3,9": 1, "grouping3,10": 2, "grouping4,1": 1, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 3, "grouping4,10": 0, "grouping5,1": 0, "grouping5,2": 0, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 2, "grouping5,9": 2, "grouping5,10": 4, "grouping6,1": 2, "grouping6,2": 2, "grouping6,3": 2, "grouping6,4": 0, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 5, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 0, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 1, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 1, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 3, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 1, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 3, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 0, "grouping5,10": 0, "grouping6,1": 1, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 0, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 0, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 2, "grouping3,8": 2, "grouping3,9": 1, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 3, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 2, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 4, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 5, "grouping6,5": 5, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 0, "grouping6,9": 3, "grouping6,10": 5}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 2, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 1, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 2, "grouping3,8": 2, "grouping3,9": 1, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 3, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 4, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 5, "grouping6,5": 5, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 0, "grouping6,9": 3, "grouping6,10": 5}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 2, "grouping3,8": 2, "grouping3,9": 1, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 3, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 4, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 5, "grouping6,5": 5, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 0, "grouping6,9": 3, "grouping6,10": 5}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 1, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 2, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 2, "grouping5,3": 0, "grouping5,4": 0, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 3, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 0, "grouping6,6": 0, "grouping6,7": 2, "grouping6,8": 1, "grouping6,9": 2, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 0, "grouping3,1": 0, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 2, "grouping3,8": 2, "grouping3,9": 1, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 3, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 1, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 4, "grouping5,9": 2, "grouping5,10": 2, "grouping6,1": 5, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 5, "grouping6,5": 5, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 0, "grouping6,9": 3, "grouping6,10": 5}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 1, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 2, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 2, "grouping5,3": 0, "grouping5,4": 0, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 3, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 0, "grouping6,6": 0, "grouping6,7": 2, "grouping6,8": 1, "grouping6,9": 2, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 1, "grouping4,1": 2, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 2, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 0, "grouping5,4": 0, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 3, "grouping6,6": 0, "grouping6,7": 2, "grouping6,8": 1, "grouping6,9": 2, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 0, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 0, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 4, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 1, "grouping4,1": 2, "grouping4,2": 2, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 2, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 2, "grouping5,3": 0, "grouping5,4": 0, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 3, "grouping6,1": 1, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 0, "grouping6,6": 0, "grouping6,7": 2, "grouping6,8": 1, "grouping6,9": 2, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 1, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 3, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 1, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 1, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 0, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 2, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 4, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 0, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 0, "grouping5,1": 1, "grouping5,2": 2, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 0, "grouping5,9": 2, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 5, "grouping6,3": 5, "grouping6,4": 5, "grouping6,5": 2, "grouping6,6": 3, "grouping6,7": 1, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 1, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 0, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 0, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 2, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 1, "grouping5,10": 0, "grouping6,1": 1, "grouping6,2": 4, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 0, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 0, "grouping2,4": 0, "grouping2,5": 0, "grouping2,6": 1, "grouping2,7": 0, "grouping2,8": 1, "grouping2,9": 0, "grouping2,10": 0, "grouping3,1": 1, "grouping3,2": 2, "grouping3,3": 2, "grouping3,4": 2, "grouping3,5": 2, "grouping3,6": 2, "grouping3,7": 2, "grouping3,8": 2, "grouping3,9": 1, "grouping3,10": 2, "grouping4,1": 1, "grouping4,2": 3, "grouping4,3": 3, "grouping4,4": 3, "grouping4,5": 3, "grouping4,6": 0, "grouping4,7": 2, "grouping4,8": 2, "grouping4,9": 3, "grouping4,10": 0, "grouping5,1": 0, "grouping5,2": 0, "grouping5,3": 1, "grouping5,4": 1, "grouping5,5": 0, "grouping5,6": 2, "grouping5,7": 0, "grouping5,8": 2, "grouping5,9": 2, "grouping5,10": 4, "grouping6,1": 3, "grouping6,2": 2, "grouping6,3": 2, "grouping6,4": 0, "grouping6,5": 1, "grouping6,6": 3, "grouping6,7": 3, "grouping6,8": 5, "grouping6,9": 5, "grouping6,10": 1}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 1, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 3, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 5, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 1, "grouping4,1": 2, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 2, "grouping4,7": 1, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 3, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 0, "grouping5,4": 0, "grouping5,5": 1, "grouping5,6": 3, "grouping5,7": 3, "grouping5,8": 3, "grouping5,9": 4, "grouping5,10": 3, "grouping6,1": 3, "grouping6,2": 1, "grouping6,3": 1, "grouping6,4": 1, "grouping6,5": 3, "grouping6,6": 0, "grouping6,7": 2, "grouping6,8": 1, "grouping6,9": 2, "grouping6,10": 0}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 0, "grouping5,10": 0, "grouping6,1": 1, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 1, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 1, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 1, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 0, "grouping4,2": 0, "grouping4,3": 0, "grouping4,4": 0, "grouping4,5": 0, "grouping4,6": 3, "grouping4,7": 3, "grouping4,8": 0, "grouping4,9": 1, "grouping4,10": 1, "grouping5,1": 1, "grouping5,2": 2, "grouping5,3": 2, "grouping5,4": 2, "grouping5,5": 2, "grouping5,6": 4, "grouping5,7": 4, "grouping5,8": 0, "grouping5,9": 1, "grouping5,10": 3, "grouping6,1": 0, "grouping6,2": 0, "grouping6,3": 0, "grouping6,4": 2, "grouping6,5": 2, "grouping6,6": 1, "grouping6,7": 4, "grouping6,8": 3, "grouping6,9": 1, "grouping6,10": 3}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 0, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 0, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 4, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 0, "grouping5,10": 0, "grouping6,1": 4, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 4, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 0, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 0, "grouping2,6": 0, "grouping2,7": 0, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 0, "grouping3,3": 0, "grouping3,4": 0, "grouping3,5": 0, "grouping3,6": 1, "grouping3,7": 0, "grouping3,8": 0, "grouping3,9": 0, "grouping3,10": 2, "grouping4,1": 3, "grouping4,2": 2, "grouping4,3": 2, "grouping4,4": 2, "grouping4,5": 2, "grouping4,6": 2, "grouping4,7": 0, "grouping4,8": 3, "grouping4,9": 2, "grouping4,10": 3, "grouping5,1": 2, "grouping5,2": 4, "grouping5,3": 4, "grouping5,4": 4, "grouping5,5": 4, "grouping5,6": 1, "grouping5,7": 2, "grouping5,8": 3, "grouping5,9": 0, "grouping5,10": 0, "grouping6,1": 1, "grouping6,2": 4, "grouping6,3": 4, "grouping6,4": 4, "grouping6,5": 0, "grouping6,6": 2, "grouping6,7": 5, "grouping6,8": 2, "grouping6,9": 4, "grouping6,10": 2}, {"grouping1,1": 0, "grouping1,2": 0, "grouping1,3": 0, "grouping1,4": 0, "grouping1,5": 0, "grouping1,6": 0, "grouping1,7": 0, "grouping1,8": 0, "grouping1,9": 0, "grouping1,10": 0, "grouping2,1": 0, "grouping2,2": 1, "grouping2,3": 1, "grouping2,4": 1, "grouping2,5": 1, "grouping2,6": 0, "grouping2,7": 1, "grouping2,8": 0, "grouping2,9": 1, "grouping2,10": 1, "grouping3,1": 2, "grouping3,2": 1, "grouping3,3": 1, "grouping3,4": 1, "grouping3,5": 1, "grouping3,6": 0, "grouping3,7": 1, "grouping3,8": 1, "grouping3,9": 2, "grouping3,10": 0, "grouping4,1": 2, "grouping4,2": 1, "grouping4,3": 1, "grouping4,4": 1, "grouping4,5": 1, "grouping4,6": 1, "grouping4,7": 1, "grouping4,8": 1, "grouping4,9": 0, "grouping4,10": 2, "grouping5,1": 3, "grouping5,2": 3, "grouping5,3": 3, "grouping5,4": 3, "grouping5,5": 3, "grouping5,6": 0, "grouping5,7": 1, "grouping5,8": 1, "grouping5,9": 3, "grouping5,10": 1, "grouping6,1": 3, "grouping6,2": 1, "grouping6,3": 3, "grouping6,4": 3, "grouping6,5": 3, "grouping6,6": 4, "grouping6,7": 0, "grouping6,8": 4, "grouping6,9": 0, "grouping6,10": 4}];

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const queryKeywordEmphasis = writable(3);
    const visKeywordEmphasis = writable(3);
    const visNumClusters = writable(5);
    const displayNames = writable(false);
    const datasetChoice = writable("Most Cited Publications");
    const selectedResearchInterest = writable("");
    const displayDistributions = writable(false);
    // const selectedDataset = writable("ML_MOST_CITED");

    const selectedResearcherInfo = writable({
      name: "",
      affiliation: "",
      scholarKeywords: ["","","","",""],
      citations: "",
      url: "",
      pictureURL: "https://scholar.google.com/citations/images/avatar_scholar_256.png"
    });

    /* src\components\PeopleMapView.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;

    const file = "src\\components\\PeopleMapView.svelte";

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let nav;
    	let input0;
    	let t1;
    	let label0;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let input1;
    	let t7;
    	let input2;
    	let t8;
    	let label1;
    	let t9;
    	let p2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			nav = element("nav");
    			input0 = element("input");
    			t1 = space();
    			label0 = element("label");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Show All Names";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "#Clusters";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			label1 = element("label");
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Show Gradients";
    			attr_dev(div, "id", "PeopleMap");
    			set_style(div, "width", "100%");
    			set_style(div, "height", "100%");
    			set_style(div, "background", "#FFFFFF");
    			add_location(div, file, 0, 0, 0);
    			attr_dev(input0, "id", "ShowNamesSwitch");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "name", "ShowNamesSwitch");
    			attr_dev(input0, "class", "switch is-small is-rounded");
    			set_style(input0, "padding-top", "0px");
    			set_style(input0, "color", "purple");
    			set_style(input0, "min-width", "200px");
    			add_location(input0, file, 1207, 2, 39897);
    			attr_dev(label0, "for", "ShowNamesSwitch");
    			attr_dev(label0, "class", "svelte-1hln9ad");
    			add_location(label0, file, 1209, 2, 40109);
    			attr_dev(p0, "class", "text is-black");
    			set_style(p0, "width", "105%");
    			set_style(p0, "padding-top", "14px");
    			set_style(p0, "min-width", "140px");
    			add_location(p0, file, 1210, 2, 40151);
    			attr_dev(p1, "class", "text is-black");
    			set_style(p1, "padding-top", "14px");
    			add_location(p1, file, 1212, 2, 40258);
    			attr_dev(input1, "id", "sliderWithValue");
    			attr_dev(input1, "class", "slider has-output svelte-1v4uv99 is-circle is-purple");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "6");
    			attr_dev(input1, "step", "1");
    			attr_dev(input1, "type", "range");
    			set_style(input1, "margin-top", "0px");
    			set_style(input1, "outline", "none");
    			set_style(input1, "border-top-width", "0px");
    			set_style(input1, "border-right-width", "0px");
    			set_style(input1, "border-left-width", "0px");
    			set_style(input1, "border-bottom-width", "0px");
    			set_style(input1, "width", "150px");
    			set_style(input1, "padding-top", "37px");
    			set_style(input1, "fill", "#652DC1");
    			set_style(input1, "padding-right", "25px");
    			add_location(input1, file, 1213, 2, 40327);
    			attr_dev(input2, "id", "ShowGradientsSwitch");
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "name", "ShowGradientsSwitch");
    			attr_dev(input2, "class", "switch is-small is-rounded");
    			set_style(input2, "padding-top", "0px");
    			add_location(input2, file, 1215, 2, 40690);
    			attr_dev(label1, "for", "ShowGradientsSwitch");
    			attr_dev(label1, "class", "svelte-1hln9ad");
    			add_location(label1, file, 1217, 2, 40884);
    			attr_dev(p2, "class", "text is-black");
    			set_style(p2, "padding-top", "14px");
    			set_style(p2, "width", "20%");
    			set_style(p2, "min-width", "150px");
    			add_location(p2, file, 1218, 2, 40930);
    			attr_dev(nav, "class", "level is-mobile");
    			set_style(nav, "padding-top", "0px");
    			set_style(nav, "margin-top", "0px");
    			set_style(nav, "padding-bottom", "15px");
    			set_style(nav, "padding-left", "15px");
    			set_style(nav, "height", "30px");
    			set_style(nav, "min-width", "1340");
    			add_location(nav, file, 1206, 0, 39748);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, input0);
    			input0.checked = /*$displayNames*/ ctx[0];
    			append_dev(nav, t1);
    			append_dev(nav, label0);
    			append_dev(nav, t2);
    			append_dev(nav, p0);
    			append_dev(nav, t4);
    			append_dev(nav, p1);
    			append_dev(nav, t6);
    			append_dev(nav, input1);
    			set_input_value(input1, /*$visNumClusters*/ ctx[1]);
    			append_dev(nav, t7);
    			append_dev(nav, input2);
    			input2.checked = /*$displayDistributions*/ ctx[2];
    			append_dev(nav, t8);
    			append_dev(nav, label1);
    			append_dev(nav, t9);
    			append_dev(nav, p2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "change", /*input0_change_handler*/ ctx[16]),
    				listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[17]),
    				listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[17]),
    				listen_dev(input2, "change", /*input2_change_handler*/ ctx[18])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$displayNames*/ 1) {
    				input0.checked = /*$displayNames*/ ctx[0];
    			}

    			if (dirty & /*$visNumClusters*/ 2) {
    				set_input_value(input1, /*$visNumClusters*/ ctx[1]);
    			}

    			if (dirty & /*$displayDistributions*/ 4) {
    				input2.checked = /*$displayDistributions*/ ctx[2];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $displayNames;
    	let $visNumClusters;
    	let $displayDistributions;
    	let $selectedResearchInterest;
    	let $visKeywordEmphasis;
    	let $queryKeywordEmphasis;
    	validate_store(displayNames, "displayNames");
    	component_subscribe($$self, displayNames, $$value => $$invalidate(0, $displayNames = $$value));
    	validate_store(visNumClusters, "visNumClusters");
    	component_subscribe($$self, visNumClusters, $$value => $$invalidate(1, $visNumClusters = $$value));
    	validate_store(displayDistributions, "displayDistributions");
    	component_subscribe($$self, displayDistributions, $$value => $$invalidate(2, $displayDistributions = $$value));
    	validate_store(selectedResearchInterest, "selectedResearchInterest");
    	component_subscribe($$self, selectedResearchInterest, $$value => $$invalidate(9, $selectedResearchInterest = $$value));
    	validate_store(visKeywordEmphasis, "visKeywordEmphasis");
    	component_subscribe($$self, visKeywordEmphasis, $$value => $$invalidate(10, $visKeywordEmphasis = $$value));
    	validate_store(queryKeywordEmphasis, "queryKeywordEmphasis");
    	component_subscribe($$self, queryKeywordEmphasis, $$value => $$invalidate(11, $queryKeywordEmphasis = $$value));

    	for (var i = 0; i < citedClusters.length; i++) {
    		citedCoordinates[i]["grouping1,0"] = citedCoordinates[i]["grouping1"];
    		citedCoordinates[i]["grouping2,0"] = citedCoordinates[i]["grouping2"];
    		citedCoordinates[i]["grouping3,0"] = citedCoordinates[i]["grouping3"];
    		citedCoordinates[i]["grouping4,0"] = citedCoordinates[i]["grouping4"];
    		citedCoordinates[i]["grouping5,0"] = citedCoordinates[i]["grouping5"];
    		citedCoordinates[i]["grouping6,0"] = citedCoordinates[i]["grouping6"];

    		for (var k = 1; k <= 10; k++) {
    			citedCoordinates[i]["grouping1," + k] = citedClusters[i]["grouping1," + k];
    			citedCoordinates[i]["grouping2," + k] = citedClusters[i]["grouping2," + k];
    			citedCoordinates[i]["grouping3," + k] = citedClusters[i]["grouping3," + k];
    			citedCoordinates[i]["grouping4," + k] = citedClusters[i]["grouping4," + k];
    			citedCoordinates[i]["grouping5," + k] = citedClusters[i]["grouping5," + k];
    			citedCoordinates[i]["grouping6," + k] = citedClusters[i]["grouping6," + k];
    		}
    	}

    	// Merge the data between recentCoordinates and recentClusters
    	for (var i = 0; i < recentClusters.length; i++) {
    		recentCoordinates[i]["grouping1,0"] = recentCoordinates[i]["grouping1"];
    		recentCoordinates[i]["grouping2,0"] = recentCoordinates[i]["grouping2"];
    		recentCoordinates[i]["grouping3,0"] = recentCoordinates[i]["grouping3"];
    		recentCoordinates[i]["grouping4,0"] = recentCoordinates[i]["grouping4"];
    		recentCoordinates[i]["grouping5,0"] = recentCoordinates[i]["grouping5"];
    		recentCoordinates[i]["grouping6,0"] = recentCoordinates[i]["grouping6"];

    		for (var k = 1; k <= 10; k++) {
    			recentCoordinates[i]["grouping1," + k] = recentClusters[i]["grouping1," + k];
    			recentCoordinates[i]["grouping2," + k] = recentClusters[i]["grouping2," + k];
    			recentCoordinates[i]["grouping3," + k] = recentClusters[i]["grouping3," + k];
    			recentCoordinates[i]["grouping4," + k] = recentClusters[i]["grouping4," + k];
    			recentCoordinates[i]["grouping5," + k] = recentClusters[i]["grouping5," + k];
    			recentCoordinates[i]["grouping6," + k] = recentClusters[i]["grouping6," + k];
    		}
    	}

    	var currTimeout = null;
    	var currentSelectedFaculty = citedCoordinates;
    	var currentSelectedFacultyRankData = citedRankData;
    	let hideAllTextTimeout = null;
    	let hideTextAnimating = false;
    	onMount(renderGraph);

    	// Hide all names when user hovers over the white space
    	const hideNames = (duration = 300) => {
    		if (!hideTextAnimating) {
    			hideTextAnimating = true;

    			d3.select("#PeopleMap").select("svg").selectAll("text.name-text").transition("hideText").duration(duration).ease(d3.easeCubicInOut).style("opacity", 0).on("end", () => {
    				hideTextAnimating = false;
    			});
    		}

    		// Refresh the timeout
    		clearTimeout(hideAllTextTimeout);

    		hideAllTextTimeout = setTimeout(showNames, 300);
    	};

    	// Show name if the mouse doesnt move for a certain time
    	const showNames = (duration = 300) => {
    		d3.select("#PeopleMap").select("svg").selectAll("text.name-text").transition("showText").duration(duration).ease(d3.easeCubicInOut).style("opacity", 1);
    	};

    	function renderGraph() {
    		var chartDiv = document.getElementById("PeopleMap");
    		var width = chartDiv.clientWidth;
    		var height = chartDiv.clientHeight;

    		// Calculate emphasis range
    		var countEmphasis = 0;

    		while (currentSelectedFaculty[0]["x" + countEmphasis] != null) {
    			countEmphasis += 1;
    		}

    		countEmphasis = countEmphasis - 1;
    		console.log(width);
    		console.log(height);

    		// append the svg object to the body of the page
    		var svg = d3.select("#PeopleMap").append("svg").attr("width", width).attr("height", height).append("g");

    		// Rectangle for registering clicks on the graph
    		svg.append("rect").attr("width", width).attr("height", height).attr("opacity", "0%").on("click", function (d) {
    			handleClick(currentlyClicked);
    		}).on("mousemove", () => {
    			
    		});

    		// Set domain of the xAxis
    		var x = d3.scaleLinear().range([80, width - 150]);

    		x.domain([
    			d3.min(currentSelectedFaculty, function (d) {
    				var min = d.x0;

    				for (var i = 0; i <= countEmphasis; i++) {
    					if (d["x" + i] < min) {
    						min = d["x" + i];
    					}
    				}

    				return min;
    			}),
    			d3.max(currentSelectedFaculty, function (d) {
    				var max = d.x0;

    				for (var i = 0; i <= countEmphasis; i++) {
    					if (d["x" + i] > max) {
    						max = d["x" + i];
    					}
    				}

    				return max;
    			})
    		]);

    		// Append xAxis
    		var xAxis = svg.append("g").attr("transform", "translate(0," + height + ")");

    		// Set domain of yAxis
    		var y = d3.scaleLinear().range([height - 60, 20]);

    		y.domain([
    			d3.min(currentSelectedFaculty, function (d) {
    				var min = d.y0;

    				for (var i = 0; i <= countEmphasis; i++) {
    					if (d["y" + i] < min) {
    						min = d["y" + i];
    					}
    				}

    				return min;
    			}),
    			d3.max(currentSelectedFaculty, function (d) {
    				var max = d.y0;

    				for (var i = 0; i <= countEmphasis; i++) {
    					if (d["y" + i] > max) {
    						max = d["y" + i];
    					}
    				}

    				return max;
    			})
    		]);

    		// Append yAxis
    		var yAxis = svg.append("g");

    		// Red, Orange, Yellow, Green, Turqoise, Blue
    		var colors = ["#eb3b5a", "#fa8231", "#f7b731", "#20bf6b", "#2d98da", "#8854d0"];

    		// 7 shade gradient of purple, starting with most dark and growing lighter after that
    		var purpleGradient = [
    			"#3f007d",
    			"#54278f",
    			"#6a51a3",
    			"#807dba",
    			"#9e9ac8",
    			"#bcbddc",
    			"#dadaeb",
    			"#efedf5",
    			"#fcfbfd"
    		];

    		// Filter out data with the selection
    		var dataFilter = currentSelectedFaculty.map(function (d) {
    			return {
    				xCoordinate: d["x3"],
    				yCoordinate: d["y3"],
    				Author: d.Author,
    				Group: d.grouping6,
    				Affiliation: d.Affiliation,
    				KeyWords: d.KeyWords,
    				Citations: d.Citations,
    				URL: d.URL,
    				PictureURL: d.PictureURL
    			};
    		});

    		var totalAuthors = {};

    		for (var i = 0; i < dataFilter.length; i++) {
    			totalAuthors[dataFilter[i].Author] = true;
    		}

    		// hacky for now...
    		// window.totalAuthors = {}
    		// for (var i = 0; i < dataFilter.length; i++) {
    		//   window.totalAuthors[dataFilter[i].Author] = true;
    		// }
    		// console.log(window.totalAuthors)
    		// Currently click author
    		var currentlyClicked = "";

    		// Assign researcher detail view to display the first datapoint data
    		var keywordTokens = dataFilter[0].KeyWords.split(", ");

    		var finalTokens = ["", "", "", "", ""];

    		for (var i = 0; i < keywordTokens.length; i++) {
    			finalTokens[i] = keywordTokens[i];
    		}

    		var updatedResearcherSelection = {
    			name: dataFilter[0].Author,
    			affiliation: dataFilter[0].Affiliation,
    			scholarKeywords: finalTokens,
    			citations: dataFilter[0].Citations,
    			url: dataFilter[0].URL,
    			pictureURL: dataFilter[0].PictureURL
    		};

    		selectedResearcherInfo.set(updatedResearcherSelection);

    		//Isolates the clusters of researchers for ellipse computation
    		function splitResearchers(filteredData, groupingNumber) {
    			var arrayOfClusteredResearchers = [];
    			var total = 0;
    			var currentGroup = 0;
    			var currentSet = [];

    			while (total < filteredData.length) {
    				currentSet = filteredData.filter(function (d) {
    					if (d.Group == currentGroup) {
    						return d;
    					}
    				});

    				arrayOfClusteredResearchers[currentGroup] = currentSet;
    				total += currentSet.length;
    				currentGroup += 1;
    			}

    			return arrayOfClusteredResearchers;
    		}

    		//Separates the researcher groups into arrays of x and y coordinates
    		function generateXAndYCoordinates(splitGroups, keywordsEmphasis) {
    			var totalCoordinates = [];

    			for (var i = 0; i < splitGroups.length; i++) {
    				var currentGroup = [];

    				for (var j = 0; j < splitGroups[i].length; j++) {
    					currentGroup[j] = [splitGroups[i][j].xCoordinate, splitGroups[i][j].yCoordinate];
    				}

    				totalCoordinates[i] = currentGroup;
    			}

    			return totalCoordinates;
    		}

    		//Gets the center among all of the coordinates and the eigenvectors
    		function generateEllipseInfo(coordinateMatrices) {
    			var totalInfo = [];

    			for (var i = 0; i < coordinateMatrices.length; i++) {
    				var centerX = 0;
    				var centerY = 0;
    				var xValues = [];
    				var yValues = [];

    				for (var j = 0; j < coordinateMatrices[i].length; j++) {
    					centerX += coordinateMatrices[i][j][0];
    					centerY += coordinateMatrices[i][j][1];
    					xValues[j] = coordinateMatrices[i][j][0];
    					yValues[j] = coordinateMatrices[i][j][1];
    				}

    				centerX = centerX / coordinateMatrices[i].length;
    				centerY = centerY / coordinateMatrices[i].length;
    				var covarianceMatrix = lib$2(xValues, yValues);
    				var eigenvectors = SingularValueDecomposition.SVD(covarianceMatrix).u;
    				var eigenvalues = SingularValueDecomposition.SVD(covarianceMatrix).q;

    				var currentEllipseData = {
    					CenterX: centerX,
    					CenterY: centerY,
    					Eigenvectors: eigenvectors,
    					Eigenvalues: eigenvalues,
    					Group: i
    				};

    				totalInfo[i] = currentEllipseData;
    			}

    			return totalInfo;
    		}

    		// Process initial info for ellipses
    		var separation = splitResearchers(dataFilter);

    		var completedSet = generateXAndYCoordinates(separation);
    		var ellipseInfo = generateEllipseInfo(completedSet);
    		var currentEllipseInfo = ellipseInfo;

    		// Ellipses representing the Gaussian distribution
    		var outerEllipse = svg.selectAll("outerEllipse").data(ellipseInfo).enter().append("ellipse");

    		outerEllipse.attr("rx", function (d) {
    			return x(d.Eigenvalues[0] / d.Eigenvalues[1]) / 4;
    		}).attr("ry", function (d) {
    			return y(d.Eigenvalues[1]) / 4;
    		}).attr("transform", function (d) {
    			var angle = Math.atan(d.Eigenvectors[0][1] / d.Eigenvectors[0][0]);
    			angle = angle / 3.1415 * 180 + 90;
    			return "translate(" + x(d.CenterX) + "," + y(d.CenterY) + ") rotate(" + angle + ")";
    		}).style("fill", function (d) {
    			return "url(#radial-gradient" + d.Group + ")";
    		}).style("mix-blend-mode", "multiply").attr("opacity", "0%");

    		// Set the jittering width
    		var jitterWidth = 0;

    		// Initialize dots with Zero Keywords and Five Clusters
    		var dot = svg.selectAll("circle").data(dataFilter).enter().append("circle").attr("cx", function (d) {
    			return x(d.xCoordinate) + Math.random() * jitterWidth;
    		}).attr("cy", function (d) {
    			return y(d.yCoordinate) + Math.random() * jitterWidth;
    		}).attr("r", 8).style("fill", function (d) {
    			return colors[d.Group];
    		}).attr("opacity", "70%").on("mousemove", () => {
    			d3.event.stopPropagation();
    		}).on("mouseover", function (dataPoint) {
    			if (currentlyClicked == "") {
    				// Bypass the hide text timeout and show all text
    				showNames(0);

    				var keywordTokens = dataPoint.KeyWords.split(", ");
    				var finalTokens = ["", "", "", "", ""];

    				for (var i = 0; i < keywordTokens.length; i++) {
    					finalTokens[i] = keywordTokens[i];
    				}

    				var updatedResearcherSelection = {
    					name: dataPoint.Author,
    					affiliation: dataPoint.Affiliation,
    					scholarKeywords: finalTokens,
    					citations: dataPoint.Citations,
    					url: dataPoint.URL,
    					pictureURL: dataPoint.PictureURL
    				};

    				selectedResearcherInfo.set(updatedResearcherSelection);

    				text.data(dataFilter).transition().duration(300).text(function (d) {
    					if (d.Author == dataPoint.Author) {
    						return d.Author;
    					} else {
    						return "";
    					}
    				});

    				dot.data(dataFilter).transition().duration(300).attr("opacity", function (d) {
    					if (d.Author == dataPoint.Author) {
    						return "100%";
    					} else {
    						return "20%";
    					}
    				}).attr("r", function (d) {
    					if (d.Author == dataPoint.Author) {
    						return 10;
    					} else {
    						return 8;
    					}
    				});
    			}
    		}).on("mouseout", function (dataPoint) {
    			hideNames(0);

    			text.data(dataFilter).transition().duration(300).text(function (d) {
    				if ($displayNames == true) {
    					return d.Author;
    				} else {
    					return "";
    				}
    			});

    			dot.data(dataFilter).transition().duration(300).attr("opacity", function (d) {
    				if (currentlyClicked != "") {
    					if (currentlyClicked == d.Author) {
    						return "100%";
    					} else {
    						return "20%";
    					}
    				} else {
    					return "70%";
    				}
    			}).attr("r", function (d) {
    				if (currentlyClicked != "") {
    					if (currentlyClicked == d.Author) {
    						return 10;
    					} else {
    						return 8;
    					}
    				} else {
    					return 8;
    				}
    			});
    		}).on("click", function (dataPoint) {
    			handleClick(dataPoint.Author);
    		});

    		var text = svg.selectAll("text").data(dataFilter).enter().append("text").attr("class", "name-text").text(function (d) {
    			return "";
    		}).attr("x", function (d) {
    			return x(d.xCoordinate) + 10 + Math.random() * jitterWidth;
    		}).attr("y", function (d) {
    			return y(d.yCoordinate) + 4 + Math.random() * jitterWidth;
    		}).style("text-shadow", "-1.5px 0 white, 0 1.5px white, 1.5px 0 white, 0 -1.5px white").attr("font_family", "sans-serif").attr("font-size", "11px").attr("fill", "black").style("cursor", "pointer"); // Font type
    		// Font size
    		// Font color

    		// Insert ResearchQuery Legend
    		var legend = svg.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");

    		legend.append("stop").attr("offset", "0%").attr("stop-color", "#3f007d").attr("stop-opacity", 1);
    		legend.append("stop").attr("offset", "100%").attr("stop-color", "#dadaeb").attr("stop-opacity", 1);
    		var legendRect = svg.append("rect").attr("width", 15).attr("height", 150).style("fill", "url(#gradient)").attr("transform", "translate(" + (width - 40) + ", 15)").attr("opacity", "0%");

    		// Legend tags    
    		var topTag = svg.append("text").text("More Aligned").attr("x", width - 110).attr("y", 20).attr("font_family", "sans-serif").attr("font-size", "10px").attr("fill", "black").attr("opacity", "0%"); // Font type
    		// Font size
    		// Font color

    		var bottomTag = svg.append("text").text("Less Aligned").attr("x", width - 110).attr("y", 165).attr("font_family", "sans-serif").attr("font-size", "10px").attr("fill", "black").attr("opacity", "0%"); // Font type
    		// Font size
    		// Font color

    		// Add gradient ellipses
    		var defs = svg.append("defs");

    		//Append a radialGradient element to the defs and give it a unique id
    		var radialGradient0 = defs.append("radialGradient").attr("id", "radial-gradient0").attr("rx", "50%").attr("ry", "50%");

    		radialGradient0.append("stop").attr("offset", "0%").attr("stop-color", colors[0]).attr("opacity", "50%");
    		radialGradient0.append("stop").attr("offset", "100%").attr("stop-color", "#F8F8F8").attr("opacity", "50%");
    		var radialGradient1 = defs.append("radialGradient").attr("id", "radial-gradient1").attr("rx", "50%").attr("ry", "50%");
    		radialGradient1.append("stop").attr("offset", "0%").attr("stop-color", colors[1]).attr("opacity", "50%");
    		radialGradient1.append("stop").attr("offset", "100%").attr("stop-color", "#F8F8F8").attr("opacity", "50%");
    		var radialGradient2 = defs.append("radialGradient").attr("id", "radial-gradient2").attr("rx", "50%").attr("ry", "50%");
    		radialGradient2.append("stop").attr("offset", "0%").attr("stop-color", colors[2]).attr("opacity", "50%");
    		radialGradient2.append("stop").attr("offset", "100%").attr("stop-color", "#F8F8F8").attr("opacity", "50%");
    		var radialGradient3 = defs.append("radialGradient").attr("id", "radial-gradient3").attr("rx", "50%").attr("ry", "50%");
    		radialGradient3.append("stop").attr("offset", "0%").attr("stop-color", colors[3]).attr("opacity", "50%");
    		radialGradient3.append("stop").attr("offset", "100%").attr("stop-color", "#F8F8F8").attr("opacity", "50%");
    		var radialGradient4 = defs.append("radialGradient").attr("id", "radial-gradient4").attr("rx", "50%").attr("ry", "50%");
    		radialGradient4.append("stop").attr("offset", "0%").attr("stop-color", colors[4]).attr("opacity", "50%");
    		radialGradient4.append("stop").attr("offset", "100%").attr("stop-color", "#F8F8F8").attr("opacity", "50%");
    		var radialGradient5 = defs.append("radialGradient").attr("id", "radial-gradient5").attr("rx", "50%").attr("ry", "50%");
    		radialGradient5.append("stop").attr("offset", "0%").attr("stop-color", colors[5]).attr("opacity", "50%");
    		radialGradient5.append("stop").attr("offset", "100%").attr("stop-color", "#F8F8F8").attr("opacity", "50%");

    		// Upon change of keywords emphasis, updates the graph visualization
    		function updateKeywords(selectedGroup, clustersNumber) {
    			// Filter out data with the selection
    			var dataFilter = currentSelectedFaculty.map(function (d) {
    				return {
    					xCoordinate: d["x" + selectedGroup],
    					yCoordinate: d["y" + selectedGroup],
    					Author: d.Author,
    					Affiliation: d.Affiliation,
    					KeyWords: d.KeyWords,
    					Citations: d.Citations,
    					URL: d.URL,
    					Group: d["grouping" + clustersNumber + "," + selectedGroup],
    					PictureURL: d.PictureURL
    				};
    			});

    			dot.data(dataFilter).attr("pointer-events", "none").transition("dot-change").duration(1000).// Temporarlly disable pointer events
    			attr("cx", function (d) {
    				return x(+d.xCoordinate) + Math.random() * jitterWidth;
    			}).attr("cy", function (d) {
    				return y(+d.yCoordinate) + Math.random() * jitterWidth;
    			}).style("fill", function (d) {
    				return colors[d.Group];
    			}).on("end", (d, i, g) => {
    				// Restore pointer events after the animation
    				d3.select(g[i]).attr("pointer-events", "auto");
    			});

    			text.data(dataFilter).transition().duration(1000).attr("x", function (d) {
    				return x(d.xCoordinate) + 10 + Math.random() * jitterWidth;
    			}).attr("y", function (d) {
    				return y(d.yCoordinate) + 4 + Math.random() * jitterWidth;
    			});
    		}

    		// A function that update the chart with a new cluster coloring
    		function updateClusters(selectedGroup, keywordsEmphasis) {
    			// Filter out data with the selection
    			var dataFilter = currentSelectedFaculty.map(function (d) {
    				return {
    					Grouping: d["grouping" + selectedGroup + "," + keywordsEmphasis],
    					Author: d.Author,
    					Affiliation: d.Affiliation,
    					KeyWords: d.KeyWords,
    					Citations: d.Citations,
    					URL: d.URL,
    					PictureURL: d.PictureURL
    				};
    			});

    			dot.data(dataFilter).transition().duration(1000).style("fill", function (d) {
    				return colors[d.Grouping];
    			});
    		}

    		// A function that update the chart with a new ranking coloring
    		function updateRanking(phrase, emphasis) {
    			// Assign new ranking for current Research Query
    			for (var i = 0; i < currentSelectedFaculty.length; i++) {
    				currentSelectedFaculty[i].currentRank = currentSelectedFacultyRankData[phrase][emphasis][i].rank;
    			}

    			// Filter out data with the selection
    			var dataFilter = currentSelectedFaculty.map(function (d) {
    				return {
    					Author: d.Author,
    					Affiliation: d.Affiliation,
    					CurrentRank: d.currentRank,
    					KeyWords: d.KeyWords,
    					Citations: d.Citations,
    					URL: d.URL,
    					PictureURL: d.PictureURL
    				};
    			});

    			dot.data(dataFilter).transition().duration(1000).style("fill", function (d) {
    				if (d.CurrentRank == -1 || d.CurrentRank >= 5) {
    					return purpleGradient[6];
    				} else {
    					return purpleGradient[d.CurrentRank];
    				}
    			});

    			legendRect.transition().duration(1000).attr("opacity", "100%");
    			topTag.transition().duration(1000).attr("opacity", "100%");
    			bottomTag.transition().duration(1000).attr("opacity", "100%");
    		}

    		// A function that update the chart with the researcher names, either displayed or undisplayed
    		function updateNames(selectedOption) {
    			// Filter out data with the selection
    			var dataFilter = currentSelectedFaculty.map(function (d) {
    				return {
    					Author: d.Author,
    					Affiliation: d.Affiliation,
    					KeyWords: d.KeyWords,
    					Citations: d.Citations,
    					URL: d.URL,
    					Rank: d.Rank,
    					PictureURL: d.PictureURL
    				};
    			});

    			// Track mousemove in show all name mode
    			svg.on("mousemove", selectedOption
    			? hideNames
    			: () => {
    					
    				});

    			text.data(dataFilter).transition().duration(1000).attr("font_family", "sans-serif").attr("font-size", "11px").attr("fill", "black").text(function (d) {
    				if (selectedOption == true) {
    					return d.Author; // Font type
    					// Font size
    					// Font color
    				} else {
    					return "";
    				}
    			});
    		}

    		// A function that updates the chart with a new Gaussian distribution set
    		function updateDistributions(selectedOption, keywordsEmphasis, clustersNumber) {
    			outerEllipse.data(currentEllipseInfo).transition().duration(1000).attr("opacity", "0%");

    			// Filter out data with the selection
    			var dataFilter = currentSelectedFaculty.map(function (d) {
    				return {
    					xCoordinate: d["x" + keywordsEmphasis],
    					yCoordinate: d["y" + keywordsEmphasis],
    					Author: d.Author,
    					Affiliation: d.Affiliation,
    					KeyWords: d.KeyWords,
    					Citations: d.Citations,
    					URL: d.URL,
    					Group: d["grouping" + clustersNumber + "," + keywordsEmphasis],
    					PictureURL: d.PictureURL
    				};
    			});

    			var separation = splitResearchers(dataFilter);
    			var completedSet = generateXAndYCoordinates(separation);
    			var ellipseInfo = generateEllipseInfo(completedSet);
    			currentEllipseInfo = ellipseInfo;

    			outerEllipse.data(ellipseInfo).transition().duration(1000).attr("rx", function (d) {
    				var firstEigenvalue = d.Eigenvalues[0];
    				var secondEigenvalue = d.Eigenvalues[1];
    				var confidenceInterval = Math.sqrt(d.Eigenvalues[0] * 5.991 * 4);
    				return confidenceInterval * width / 2;
    			}).attr("ry", function (d) {
    				var firstEigenvalue = d.Eigenvalues[0];
    				var secondEigenvalue = d.Eigenvalues[1];
    				var confidenceInterval = Math.abs(Math.sqrt(d.Eigenvalues[1] * 5.991 * 4));
    				return confidenceInterval * height / 2;
    			}).attr("transform", function (d) {
    				var angle = Math.atan(d.Eigenvectors[0][1] / d.Eigenvectors[0][0]);
    				angle = angle / 3.1415 * 180;
    				return "translate(" + x(d.CenterX) + "," + y(d.CenterY) + ") rotate(" + angle + ")";
    			}).style("fill", function (d) {
    				return "url(#radial-gradient" + d.Group + ")";
    			}).style("mix-blend-mode", "multiply").attr("opacity", function (d) {
    				if (selectedOption == true) {
    					return "50%";
    				} else {
    					return "0%";
    				}
    			});
    		}

    		// A function that updates the graph with the new dataset
    		function updateDataset(selectedKeywords, selectedClusters) {
    			// Filter out data with the selection
    			var dataFilter = currentSelectedFaculty.map(function (d) {
    				return {
    					xCoordinate: d["x" + selectedKeywords],
    					yCoordinate: d["y" + selectedKeywords],
    					Author: d.Author,
    					Affiliation: d.Affiliation,
    					KeyWords: d.KeyWords,
    					Citations: d.Citations,
    					URL: d.URL,
    					Grouping: d["grouping" + selectedClusters + "," + selectedKeywords],
    					PictureURL: d.PictureURL
    				};
    			});

    			dot.data(dataFilter).transition().duration(1000).attr("cx", function (d) {
    				return x(+d.xCoordinate) + Math.random() * jitterWidth;
    			}).attr("cy", function (d) {
    				return y(+d.yCoordinate) + Math.random() * jitterWidth;
    			}).style("fill", function (d) {
    				return colors[d.Grouping];
    			});

    			text.data(dataFilter).transition().duration(1000).attr("x", function (d) {
    				return x(d.xCoordinate) + 10;
    			}).attr("y", function (d) {
    				return y(d.yCoordinate) + 4;
    			});
    		}

    		function handleClick(dataPoint) {
    			if (currentlyClicked == "" & dataPoint != "") {
    				currentlyClicked = dataPoint;

    				dot.data(dataFilter).transition().duration(300).attr("opacity", function (d) {
    					if (d.Author == dataPoint) {
    						var updatedResearcherSelection = {
    							name: d.Author,
    							affiliation: d.Affiliation,
    							scholarKeywords: finalTokens,
    							citations: d.Citations,
    							url: d.URL,
    							pictureURL: d.PictureURL
    						};

    						selectedResearcherInfo.set(updatedResearcherSelection);
    						return "100%";
    					} else {
    						return "20%";
    					}
    				}).attr("r", function (d) {
    					if (d.Author == dataPoint) {
    						return 10;
    					} else {
    						return 8;
    					}
    				}).attr("stroke-width", function (d) {
    					if (d.Author == dataPoint) {
    						return "2px";
    					} else {
    						return "0px";
    					}
    				}).attr("stroke", function (d) {
    					if (d.Author == dataPoint) {
    						return "#6495ED";
    					} else {
    						return "black";
    					}
    				});
    			} else if (currentlyClicked != "" & dataPoint == currentlyClicked) {
    				dot.data(dataFilter).transition().duration(300).attr("opacity", "70%").attr("r", 8).attr("stroke-width", "0px");
    				currentlyClicked = "";
    			}
    		}

    		// When the button is changed, run the updateKeywords function and update the graph
    		visKeywordEmphasis.subscribe(selectedOption => {
    			// run the updateChart function with this selected option
    			updateKeywords(selectedOption, $visNumClusters);

    			updateDistributions($displayDistributions, selectedOption, $visNumClusters);
    			set_store_value(selectedResearchInterest, $selectedResearchInterest = "");
    			legendRect.transition().duration(1000).attr("opacity", "0%");
    			topTag.transition().duration(1000).attr("opacity", "0%");
    			bottomTag.transition().duration(1000).attr("opacity", "0%");
    		});

    		// When the button is changed, run the updateClusters function and update the graph
    		visNumClusters.subscribe(selectedOption => {
    			// run the updateChart function with this selected option
    			updateClusters(selectedOption, $visKeywordEmphasis);

    			updateDistributions($displayDistributions, $visKeywordEmphasis, selectedOption);
    			set_store_value(selectedResearchInterest, $selectedResearchInterest = "");
    			legendRect.transition().duration(1000).attr("opacity", "0%");
    			topTag.transition().duration(1000).attr("opacity", "0%");
    			bottomTag.transition().duration(1000).attr("opacity", "0%");
    		});

    		// When the button is changed, run the updateNames function and update the graph
    		displayNames.subscribe(selectedOption => {
    			// run the updateNames function with this selected option
    			updateNames(selectedOption);
    		});

    		// When the button is changed, run the updateDistributions function and update the graph
    		displayDistributions.subscribe(selectedOption => {
    			updateDistributions(selectedOption, $visKeywordEmphasis, $visNumClusters);

    			if (selectedOption == true) {
    				set_store_value(selectedResearchInterest, $selectedResearchInterest = "");
    				legendRect.transition().duration(1000).attr("opacity", "0%");
    				topTag.transition().duration(1000).attr("opacity", "0%");
    				bottomTag.transition().duration(1000).attr("opacity", "0%");
    			}
    		});

    		// When a new research query is inputted, update the graph with the new ranking
    		selectedResearchInterest.subscribe(value => {
    			console.log(value);

    			if (value == "") {
    				legendRect.transition().duration(1000).attr("opacity", "0%");
    				topTag.transition().duration(1000).attr("opacity", "0%");
    				bottomTag.transition().duration(1000).attr("opacity", "0%");
    				console.log("Hello");
    				updateClusters($visNumClusters, $visKeywordEmphasis);
    				console.log(currentlyClicked);
    				handleClick(currentlyClicked);

    				//updateClusters($visNumClusters, $visKeywordEmphasis)
    				return;
    			}

    			if (totalAuthors[value]) {
    				console.log("AUTHOR SELECT");
    				handleClick(value);
    				return;
    			}

    			var emphasis = $queryKeywordEmphasis;

    			if (currentSelectedFacultyRankData[value.toLowerCase()]) {
    				set_store_value(displayDistributions, $displayDistributions = false);
    				updateRanking(value.toLowerCase(), emphasis);
    			}

    			updateDistributions($displayDistributions, $visKeywordEmphasis, $visNumClusters);
    		});

    		// When a new dataset is selected, update the graph with the new dataset
    		datasetChoice.subscribe(value => {
    			if (value == "Most Cited Publications") {
    				currentSelectedFaculty = citedCoordinates;
    				currentSelectedFacultyRankData = citedRankData;
    			} else if (value == "Most Recent Publications") {
    				currentSelectedFaculty = recentCoordinates;
    				currentSelectedFacultyRankData = recentRankData;
    			}

    			set_store_value(selectedResearchInterest, $selectedResearchInterest = "");
    			updateDataset($visKeywordEmphasis, $visNumClusters);
    			updateDistributions($displayDistributions, $visKeywordEmphasis, $visNumClusters);
    			legendRect.transition().duration(1000).attr("opacity", "0%");
    			topTag.transition().duration(1000).attr("opacity", "0%");
    			bottomTag.transition().duration(1000).attr("opacity", "0%");
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<PeopleMapView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PeopleMapView", $$slots, []);

    	function input0_change_handler() {
    		$displayNames = this.checked;
    		displayNames.set($displayNames);
    	}

    	function input1_change_input_handler() {
    		$visNumClusters = to_number(this.value);
    		visNumClusters.set($visNumClusters);
    	}

    	function input2_change_handler() {
    		$displayDistributions = this.checked;
    		displayDistributions.set($displayDistributions);
    	}

    	$$self.$capture_state = () => ({
    		cov: lib$2,
    		SingularValueDecomposition,
    		citedCoordinates,
    		recentCoordinates,
    		citedResearchQuery: citedRankData,
    		recentResearchQuery: recentRankData,
    		citedClusters,
    		recentClusters,
    		i,
    		k,
    		onMount,
    		selectedResearcherInfo,
    		selectedResearchInterest,
    		visKeywordEmphasis,
    		visNumClusters,
    		displayNames,
    		displayDistributions,
    		queryKeywordEmphasis,
    		datasetChoice,
    		currTimeout,
    		currentSelectedFaculty,
    		currentSelectedFacultyRankData,
    		hideAllTextTimeout,
    		hideTextAnimating,
    		hideNames,
    		showNames,
    		renderGraph,
    		$displayNames,
    		$visNumClusters,
    		$displayDistributions,
    		$selectedResearchInterest,
    		$visKeywordEmphasis,
    		$queryKeywordEmphasis
    	});

    	$$self.$inject_state = $$props => {
    		if ("i" in $$props) i = $$props.i;
    		if ("k" in $$props) k = $$props.k;
    		if ("currTimeout" in $$props) currTimeout = $$props.currTimeout;
    		if ("currentSelectedFaculty" in $$props) currentSelectedFaculty = $$props.currentSelectedFaculty;
    		if ("currentSelectedFacultyRankData" in $$props) currentSelectedFacultyRankData = $$props.currentSelectedFacultyRankData;
    		if ("hideAllTextTimeout" in $$props) hideAllTextTimeout = $$props.hideAllTextTimeout;
    		if ("hideTextAnimating" in $$props) hideTextAnimating = $$props.hideTextAnimating;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$displayNames,
    		$visNumClusters,
    		$displayDistributions,
    		i,
    		k,
    		currentSelectedFaculty,
    		currentSelectedFacultyRankData,
    		hideAllTextTimeout,
    		hideTextAnimating,
    		$selectedResearchInterest,
    		$visKeywordEmphasis,
    		$queryKeywordEmphasis,
    		currTimeout,
    		hideNames,
    		showNames,
    		renderGraph,
    		input0_change_handler,
    		input1_change_input_handler,
    		input2_change_handler
    	];
    }

    class PeopleMapView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PeopleMapView",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\ResearcherDetailView.svelte generated by Svelte v3.20.1 */

    const file$1 = "src\\components\\ResearcherDetailView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (65:10) { #if scholarKeyword.length != 0 }
    function create_if_block(ctx) {
    	let p;
    	let t0_value = /*scholarKeyword*/ ctx[6] + "";
    	let t0;
    	let t1;
    	let p_style_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*scholarKeyword*/ ctx[6], ...args);
    	}

    	function mouseenter_handler(...args) {
    		return /*mouseenter_handler*/ ctx[4](/*scholarKeyword*/ ctx[6], ...args);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(p, "style", p_style_value = "cursor: pointer; color: #8B72BE; text-align: left; margin-bottom: 0px; " + (/*lockedInterest*/ ctx[0] == /*scholarKeyword*/ ctx[6]
    			? "font-weight: bold;"
    			: "font-weight: normal;") + " margin-left: 20%");

    			attr_dev(p, "class", "text scholar-keyword is-size-5 svelte-1iovqvd");
    			add_location(p, file$1, 66, 10, 2390);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(p, "click", click_handler, false, false, false),
    				listen_dev(p, "mouseenter", mouseenter_handler, false, false, false),
    				listen_dev(p, "mouseleave", /*mouseleave_handler*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$selectedResearcherInfo*/ 2 && t0_value !== (t0_value = /*scholarKeyword*/ ctx[6] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*lockedInterest, $selectedResearcherInfo*/ 3 && p_style_value !== (p_style_value = "cursor: pointer; color: #8B72BE; text-align: left; margin-bottom: 0px; " + (/*lockedInterest*/ ctx[0] == /*scholarKeyword*/ ctx[6]
    			? "font-weight: bold;"
    			: "font-weight: normal;") + " margin-left: 20%")) {
    				attr_dev(p, "style", p_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(65:10) { #if scholarKeyword.length != 0 }",
    		ctx
    	});

    	return block;
    }

    // (64:8) {#each $selectedResearcherInfo.scholarKeywords as scholarKeyword }
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*scholarKeyword*/ ctx[6].length != 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*scholarKeyword*/ ctx[6].length != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(64:8) {#each $selectedResearcherInfo.scholarKeywords as scholarKeyword }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let p0;
    	let t1_value = /*$selectedResearcherInfo*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*$selectedResearcherInfo*/ ctx[1].affiliation + "";
    	let t3;
    	let t4;
    	let p2;
    	let span;
    	let t6;
    	let t7_value = /*$selectedResearcherInfo*/ ctx[1].citations + "";
    	let t7;
    	let t8;
    	let p3;
    	let a;
    	let t9;
    	let a_href_value;
    	let t10;
    	let t11;
    	let each_value = /*$selectedResearcherInfo*/ ctx[1].scholarKeywords;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p2 = element("p");
    			span = element("span");
    			span.textContent = "Citations:";
    			t6 = space();
    			t7 = text(t7_value);
    			t8 = space();
    			p3 = element("p");
    			a = element("a");
    			t9 = text("Google Scholar");
    			t10 = text(" keywords");
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = /*$selectedResearcherInfo*/ ctx[1].pictureURL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1iovqvd");
    			add_location(img, file$1, 48, 12, 1268);
    			attr_dev(div0, "class", "image-container svelte-1iovqvd");
    			add_location(div0, file$1, 47, 8, 1225);
    			attr_dev(div1, "class", "photo");
    			set_style(div1, "margin-left", "auto");
    			set_style(div1, "margin-right", "auto");
    			set_style(div1, "width", "45%");
    			set_style(div1, "display", "block");
    			set_style(div1, "padding-left", "20px");
    			set_style(div1, "padding-right", "20px");
    			set_style(div1, "padding-top", "15%");
    			add_location(div1, file$1, 46, 6, 1063);
    			attr_dev(p0, "class", "text is-size-2 has-text-weight-bold svelte-1iovqvd");
    			set_style(p0, "color", "#484848");
    			set_style(p0, "text-align", "center");
    			set_style(p0, "margin-bottom", "0px");
    			add_location(p0, file$1, 52, 8, 1411);
    			attr_dev(p1, "class", "text is-size-5 svelte-1iovqvd");
    			set_style(p1, "color", "#484848");
    			set_style(p1, "text-align", "center");
    			set_style(p1, "margin-bottom", "0px");
    			add_location(p1, file$1, 53, 8, 1569);
    			attr_dev(span, "class", "light-font");
    			add_location(span, file$1, 56, 14, 1821);
    			attr_dev(p2, "class", "text is-size-6 svelte-1iovqvd");
    			set_style(p2, "color", "#484848");
    			set_style(p2, "text-align", "center");
    			set_style(p2, "margin-bottom", "20px");
    			add_location(p2, file$1, 55, 8, 1714);
    			attr_dev(a, "href", a_href_value = /*$selectedResearcherInfo*/ ctx[1].url);
    			attr_dev(a, "target", "_blank");
    			set_style(a, "color", "#652DC1");
    			add_location(a, file$1, 60, 12, 2048);
    			attr_dev(p3, "class", "text is-size-6 svelte-1iovqvd");
    			set_style(p3, "color", "#484848");
    			set_style(p3, "text-align", "left");
    			set_style(p3, "margin-bottom", "0px");
    			set_style(p3, "padding-left", "20%");
    			add_location(p3, file$1, 59, 8, 1927);
    			attr_dev(div2, "class", "content");
    			set_style(div2, "min-width", "410px");
    			add_location(div2, file$1, 51, 6, 1354);
    			attr_dev(div3, "class", "column");
    			add_location(div3, file$1, 45, 4, 1035);
    			attr_dev(div4, "class", "columns is-centered");
    			set_style(div4, "background", "#F8F8F8");
    			set_style(div4, "min-width", "410px");
    			set_style(div4, "cursor", "default");
    			add_location(div4, file$1, 44, 2, 933);
    			set_style(div5, "background", "#F8F8F8");
    			add_location(div5, file$1, 42, 0, 893);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, p1);
    			append_dev(p1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, p2);
    			append_dev(p2, span);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			append_dev(div2, t8);
    			append_dev(div2, p3);
    			append_dev(p3, a);
    			append_dev(a, t9);
    			append_dev(p3, t10);
    			append_dev(div2, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$selectedResearcherInfo*/ 2 && img.src !== (img_src_value = /*$selectedResearcherInfo*/ ctx[1].pictureURL)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$selectedResearcherInfo*/ 2 && t1_value !== (t1_value = /*$selectedResearcherInfo*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$selectedResearcherInfo*/ 2 && t3_value !== (t3_value = /*$selectedResearcherInfo*/ ctx[1].affiliation + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$selectedResearcherInfo*/ 2 && t7_value !== (t7_value = /*$selectedResearcherInfo*/ ctx[1].citations + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*$selectedResearcherInfo*/ 2 && a_href_value !== (a_href_value = /*$selectedResearcherInfo*/ ctx[1].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*lockedInterest, $selectedResearcherInfo, selectedResearchInterest*/ 3) {
    				each_value = /*$selectedResearcherInfo*/ ctx[1].scholarKeywords;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $selectedResearcherInfo;
    	validate_store(selectedResearcherInfo, "selectedResearcherInfo");
    	component_subscribe($$self, selectedResearcherInfo, $$value => $$invalidate(1, $selectedResearcherInfo = $$value));
    	var researcherLocked = false;
    	var lockedInterest = "";

    	selectedResearchInterest.subscribe(value => {
    		if (value.length == 0) $$invalidate(0, lockedInterest = "");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResearcherDetailView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ResearcherDetailView", $$slots, []);

    	const click_handler = scholarKeyword => {
    		if (lockedInterest.length == 0) $$invalidate(0, lockedInterest = scholarKeyword); else $$invalidate(0, lockedInterest = "");
    	};

    	const mouseenter_handler = scholarKeyword => {
    		selectedResearchInterest.set(scholarKeyword);
    	};

    	const mouseleave_handler = () => {
    		selectedResearchInterest.set(lockedInterest);
    	};

    	$$self.$capture_state = () => ({
    		selectedResearcherInfo,
    		selectedResearchInterest,
    		researcherLocked,
    		lockedInterest,
    		$selectedResearcherInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("researcherLocked" in $$props) researcherLocked = $$props.researcherLocked;
    		if ("lockedInterest" in $$props) $$invalidate(0, lockedInterest = $$props.lockedInterest);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		lockedInterest,
    		$selectedResearcherInfo,
    		researcherLocked,
    		click_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class ResearcherDetailView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResearcherDetailView",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /*!
     * string_score.js: String Scoring Algorithm 0.1.22
     *
     * http://joshaven.com/string_score
     * https://github.com/joshaven/string_score
     *
     * Copyright (C) 2009-2014 Joshaven Potter <yourtech@gmail.com>
     * Special thanks to all of the contributors listed here https://github.com/joshaven/string_score
     * MIT License: http://opensource.org/licenses/MIT
     *
     * Date: Tue Mar 1 2011
     * Updated: Tue Mar 10 2015
    */

    /*jslint nomen:true, white:true, browser:true,devel:true */

    /**
     * Scores a string against another string.
     *    'Hello World'.score('he');         //=> 0.5931818181818181
     *    'Hello World'.score('Hello');    //=> 0.7318181818181818
     */
    String.prototype.score = function (word, fuzziness) {

      // If the string is equal to the word, perfect match.
      if (this === word) { return 1; }

      //if it's not a perfect match and is empty return 0
      if (word === "") { return 0; }

      var runningScore = 0,
          charScore,
          finalScore,
          string = this,
          lString = string.toLowerCase(),
          strLength = string.length,
          lWord = word.toLowerCase(),
          wordLength = word.length,
          idxOf,
          startAt = 0,
          fuzzies = 1,
          fuzzyFactor,
          i;

      // Cache fuzzyFactor for speed increase
      if (fuzziness) { fuzzyFactor = 1 - fuzziness; }

      // Walk through word and add up scores.
      // Code duplication occurs to prevent checking fuzziness inside for loop
      if (fuzziness) {
        for (i = 0; i < wordLength; i+=1) {

          // Find next first case-insensitive match of a character.
          idxOf = lString.indexOf(lWord[i], startAt);

          if (idxOf === -1) {
            fuzzies += fuzzyFactor;
          } else {
            if (startAt === idxOf) {
              // Consecutive letter & start-of-string Bonus
              charScore = 0.7;
            } else {
              charScore = 0.1;

              // Acronym Bonus
              // Weighing Logic: Typing the first character of an acronym is as if you
              // preceded it with two perfect character matches.
              if (string[idxOf - 1] === ' ') { charScore += 0.8; }
            }

            // Same case bonus.
            if (string[idxOf] === word[i]) { charScore += 0.1; }

            // Update scores and startAt position for next round of indexOf
            runningScore += charScore;
            startAt = idxOf + 1;
          }
        }
      } else {
        for (i = 0; i < wordLength; i+=1) {
          idxOf = lString.indexOf(lWord[i], startAt);
          if (-1 === idxOf) { return 0; }

          if (startAt === idxOf) {
            charScore = 0.7;
          } else {
            charScore = 0.1;
            if (string[idxOf - 1] === ' ') { charScore += 0.8; }
          }
          if (string[idxOf] === word[i]) { charScore += 0.1; }
          runningScore += charScore;
          startAt = idxOf + 1;
        }
      }

      // Reduce penalty for longer strings.
      finalScore = 0.5 * (runningScore / strLength    + runningScore / wordLength) / fuzzies;

      if ((lWord[0] === lString[0]) && (finalScore < 0.85)) {
        finalScore += 0.15;
      }

      return finalScore;
    };

    /* src\components\StatsView.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file$2 = "src\\components\\StatsView.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (153:2) {#each choices as choice}
    function create_each_block$1(ctx) {
    	let a;
    	let span;
    	let div;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*choice*/ ctx[12]["name"] + "";
    	let t1;
    	let t2;
    	let dispose;

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[11](/*choice*/ ctx[12], ...args);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();

    			attr_dev(i, "class", i_class_value = "fas " + (/*choice*/ ctx[12]["type"] == "author"
    			? "fa-user-graduate"
    			: "fa-book"));

    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$2, 156, 12, 5077);
    			add_location(div, file$2, 155, 8, 5058);
    			attr_dev(span, "class", "panel-icon");
    			add_location(span, file$2, 154, 6, 5023);
    			attr_dev(a, "class", "panel-block svelte-1cwsa7n");
    			add_location(a, file$2, 153, 4, 4928);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(span, div);
    			append_dev(div, i);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			if (remount) dispose();
    			dispose = listen_dev(a, "mousedown", mousedown_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*choices*/ 1 && i_class_value !== (i_class_value = "fas " + (/*choice*/ ctx[12]["type"] == "author"
    			? "fa-user-graduate"
    			: "fa-book"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*choices*/ 1 && t1_value !== (t1_value = /*choice*/ ctx[12]["name"] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(153:2) {#each choices as choice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div6;
    	let nav;
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let div0;
    	let p1;
    	let t4;
    	let i0;
    	let t5;
    	let div1;
    	let p2;
    	let t7;
    	let i1;
    	let t8;
    	let div4;
    	let p3;
    	let input;
    	let t9;
    	let span0;
    	let i2;
    	let t10;
    	let a0;
    	let t11;
    	let a1;
    	let span1;
    	let i3;
    	let t12;
    	let div5;
    	let dispose;
    	let each_value = /*choices*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			nav = element("nav");
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Georgia Tech ML Faculty";
    			t2 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = `${citedCoordinates.length}`;
    			t4 = space();
    			i0 = element("i");
    			t5 = space();
    			div1 = element("div");
    			p2 = element("p");
    			p2.textContent = `${Object.keys(citedRankData).length}`;
    			t7 = space();
    			i1 = element("i");
    			t8 = space();
    			div4 = element("div");
    			p3 = element("p");
    			input = element("input");
    			t9 = space();
    			span0 = element("span");
    			i2 = element("i");
    			t10 = space();
    			a0 = element("a");
    			t11 = space();
    			a1 = element("a");
    			span1 = element("span");
    			i3 = element("i");
    			t12 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "./logo.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "50px%");
    			set_style(img, "height", "50px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$2, 99, 6, 2638);
    			attr_dev(p0, "class", "text has-text-white");
    			set_style(p0, "font-size", "30px");
    			set_style(p0, "padding-right", "25px");
    			set_style(p0, "padding-right", "30px");
    			set_style(p0, "min-width", "400px");
    			add_location(p0, file$2, 100, 6, 2724);
    			attr_dev(p1, "class", "text has-text-white");
    			set_style(p1, "opacity", "75%");
    			set_style(p1, "padding-right", "5px");
    			set_style(p1, "font-size", "1.8rem");
    			add_location(p1, file$2, 106, 8, 3071);
    			attr_dev(i0, "class", "fas fa-child fa-2x");
    			set_style(i0, "color", "white");
    			set_style(i0, "opacity", "75%");
    			add_location(i0, file$2, 107, 8, 3202);
    			attr_dev(div0, "class", "level-item has-text-centered");
    			attr_dev(div0, "aria-label", "Scholars Analyzed");
    			attr_dev(div0, "data-balloon-pos", "down");
    			set_style(div0, "padding-right", "20px");
    			set_style(div0, "margin-right", "0px");
    			set_style(div0, "min-width", "65px");
    			add_location(div0, file$2, 105, 6, 2899);
    			attr_dev(p2, "class", "text has-text-white");
    			set_style(p2, "opacity", "75%");
    			set_style(p2, "padding-right", "5px");
    			set_style(p2, "font-size", "1.8rem");
    			add_location(p2, file$2, 111, 8, 3449);
    			attr_dev(i1, "class", "fas fa-atom fa-2x");
    			set_style(i1, "color", "white");
    			set_style(i1, "opacity", "75%");
    			add_location(i1, file$2, 112, 8, 3592);
    			attr_dev(div1, "class", "level-item has-text-centered");
    			attr_dev(div1, "aria-label", "Keywords Analyzed");
    			attr_dev(div1, "data-balloon-pos", "down");
    			set_style(div1, "min-width", "85px");
    			set_style(div1, "padding-right", "10px");
    			add_location(div1, file$2, 110, 6, 3296);
    			attr_dev(div2, "class", "level-left");
    			add_location(div2, file$2, 98, 4, 2606);
    			attr_dev(div3, "class", "flex-2");
    			attr_dev(div3, "style", "flex-2: flex-direction; row; justify-content: flex-start; min-width: 820px;");
    			add_location(div3, file$2, 96, 2, 2494);
    			attr_dev(input, "class", "input");
    			attr_dev(input, "id", "autocomplete-input");
    			attr_dev(input, "type", "text");
    			set_style(input, "width", "320px");
    			attr_dev(input, "placeholder", "Query a Researcher or Area of Study");
    			add_location(input, file$2, 124, 6, 3941);
    			attr_dev(i2, "class", "fas fa-search");
    			attr_dev(i2, "aria-hidden", "true");
    			add_location(i2, file$2, 129, 8, 4245);
    			attr_dev(span0, "class", "icon is-left");
    			add_location(span0, file$2, 128, 6, 4208);
    			attr_dev(p3, "class", "control has-icons-left");
    			set_style(p3, "padding-right", "10px");
    			add_location(p3, file$2, 123, 4, 3870);
    			attr_dev(a0, "class", "delete is-large");
    			set_style(a0, "padding-right", "15px");
    			add_location(a0, file$2, 133, 4, 4326);
    			attr_dev(i3, "class", "fab fa-github fa-2x");
    			add_location(i3, file$2, 141, 10, 4645);
    			attr_dev(span1, "class", "icon is-small");
    			add_location(span1, file$2, 140, 8, 4605);
    			attr_dev(a1, "href", "https://github.com/poloclub/people-map");
    			attr_dev(a1, "target", "_blank");
    			set_style(a1, "color", "white");
    			set_style(a1, "margin-left", "20px");
    			set_style(a1, "padding-top", "12px");
    			add_location(a1, file$2, 139, 4, 4471);
    			attr_dev(div4, "class", "panel-block svelte-1cwsa7n");
    			set_style(div4, "padding-left", "0px");
    			set_style(div4, "border", "0px solid white");
    			set_style(div4, "padding-left", "10px");
    			set_style(div4, "padding-right", "10px");
    			set_style(div4, "min-width", "300px");
    			set_style(div4, "overflow", "visible");
    			add_location(div4, file$2, 122, 2, 3709);
    			attr_dev(nav, "class", "level is-mobile svelte-1cwsa7n");
    			set_style(nav, "padding", "10px 10px");
    			set_style(nav, "margin-bottom", "0px");
    			set_style(nav, "width", "1340px");
    			set_style(nav, "margin-left", "auto");
    			set_style(nav, "margin-right", "auto");
    			add_location(nav, file$2, 94, 0, 2359);
    			attr_dev(div5, "id", "autocomplete-choices");
    			set_style(div5, "visibility", "overflow");
    			set_style(div5, "top", "1000px");
    			set_style(div5, "left", "10000px");
    			set_style(div5, "z-index", "100");
    			set_style(div5, "position", "absolute");
    			set_style(div5, "width", "300px");
    			set_style(div5, "background", "white");
    			add_location(div5, file$2, 151, 0, 4737);
    			set_style(div6, "background-color", "#652DC1");
    			add_location(div6, file$2, 92, 0, 2315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, nav);
    			append_dev(nav, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, p0);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, p1);
    			append_dev(div0, t4);
    			append_dev(div0, i0);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, p2);
    			append_dev(div1, t7);
    			append_dev(div1, i1);
    			append_dev(nav, t8);
    			append_dev(nav, div4);
    			append_dev(div4, p3);
    			append_dev(p3, input);
    			set_input_value(input, /*$selectedResearchInterest*/ ctx[1]);
    			append_dev(p3, t9);
    			append_dev(p3, span0);
    			append_dev(span0, i2);
    			append_dev(div4, t10);
    			append_dev(div4, a0);
    			append_dev(div4, t11);
    			append_dev(div4, a1);
    			append_dev(a1, span1);
    			append_dev(span1, i3);
    			append_dev(div6, t12);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "keydown", /*handleKeydown*/ ctx[3], false, false, false),
    				listen_dev(input, "focus", /*onFocus*/ ctx[4], false, false, false),
    				listen_dev(input, "blur", /*onBlur*/ ctx[5], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    				listen_dev(a0, "click", /*click_handler*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$selectedResearchInterest*/ 2 && input.value !== /*$selectedResearchInterest*/ ctx[1]) {
    				set_input_value(input, /*$selectedResearchInterest*/ ctx[1]);
    			}

    			if (dirty & /*handleInterestSelect, choices*/ 5) {
    				each_value = /*choices*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $selectedResearchInterest;
    	validate_store(selectedResearchInterest, "selectedResearchInterest");
    	component_subscribe($$self, selectedResearchInterest, $$value => $$invalidate(1, $selectedResearchInterest = $$value));
    	var newRankData = {};
    	var fixedKeys = [];
    	var authors = {};

    	// TODO: add this to app store.
    	citedCoordinates.forEach(curr => {
    		authors[curr["Author"]] = true;
    	});

    	datasetChoice.subscribe(value => {
    		if (value == "Most Cited") {
    			newRankData = citedRankData;
    		} else {
    			newRankData = recentRankData;
    		}

    		fixedKeys = Object.keys(newRankData).map(key => {
    			var name = key.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    			var type = "interest";
    			return { name, type };
    		});

    		for (var key in authors) {
    			fixedKeys.push({ name: key, type: "author" });
    		}
    	});

    	var choices = [];

    	selectedResearchInterest.subscribe(val => {
    		$$invalidate(0, choices = fixedKeys.sort((a, b) => b["name"].score(val) - a["name"].score(val)).slice(0, 5));
    	});

    	var handleInterestSelect = choice => {
    		selectedResearchInterest.set(choice);
    	};

    	var handleKeydown = () => {
    		var key = event.key;
    		var keyCode = event.keyCode;

    		if (keyCode == 13) {
    			selectedResearchInterest.set(choices[0]);
    		}
    	};

    	var onFocus = () => {
    		var input = document.getElementById("autocomplete-input");
    		var choices = document.getElementById("autocomplete-choices");
    		choices.style.top = input.getBoundingClientRect().top + 50 + "px";
    		choices.style.left = input.getBoundingClientRect().left + "px";
    		choices.style.width = input.getBoundingClientRect().width + "px";
    		choices.style.visibility = "visible";
    	};

    	var onBlur = () => {
    		var choices = document.getElementById("autocomplete-choices");
    		choices.style.top = "1000px";
    		choices.style.left = "1000px";
    		choices.style.visibility = "hidden";
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StatsView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("StatsView", $$slots, []);

    	function input_input_handler() {
    		$selectedResearchInterest = this.value;
    		selectedResearchInterest.set($selectedResearchInterest);
    	}

    	const click_handler = () => {
    		selectedResearchInterest.set("");
    	};

    	const mousedown_handler = choice => {
    		handleInterestSelect(choice["name"]);
    	};

    	$$self.$capture_state = () => ({
    		queryKeywordEmphasis,
    		selectedResearchInterest,
    		datasetChoice,
    		citedRankData,
    		recentRankData,
    		citedCoordinates,
    		newRankData,
    		fixedKeys,
    		authors,
    		choices,
    		handleInterestSelect,
    		handleKeydown,
    		onFocus,
    		onBlur,
    		$selectedResearchInterest
    	});

    	$$self.$inject_state = $$props => {
    		if ("newRankData" in $$props) newRankData = $$props.newRankData;
    		if ("fixedKeys" in $$props) fixedKeys = $$props.fixedKeys;
    		if ("authors" in $$props) authors = $$props.authors;
    		if ("choices" in $$props) $$invalidate(0, choices = $$props.choices);
    		if ("handleInterestSelect" in $$props) $$invalidate(2, handleInterestSelect = $$props.handleInterestSelect);
    		if ("handleKeydown" in $$props) $$invalidate(3, handleKeydown = $$props.handleKeydown);
    		if ("onFocus" in $$props) $$invalidate(4, onFocus = $$props.onFocus);
    		if ("onBlur" in $$props) $$invalidate(5, onBlur = $$props.onBlur);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		choices,
    		$selectedResearchInterest,
    		handleInterestSelect,
    		handleKeydown,
    		onFocus,
    		onBlur,
    		newRankData,
    		fixedKeys,
    		authors,
    		input_input_handler,
    		click_handler,
    		mousedown_handler
    	];
    }

    class StatsView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatsView",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\SummaryView.svelte generated by Svelte v3.20.1 */

    const file$3 = "src\\components\\SummaryView.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let ul0;
    	let li0;
    	let a0;
    	let t9;
    	let p3;
    	let t11;
    	let ul1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "What is PeopleMap?";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Discovering research expertise at institutions can be a difficult task. Manually curated university directories easily become out of date and often lack the information necessary to understand a researcher’s interests and past work, making it harder to explore the diversity of research at an institution and pinpoint potential collaborators, resulting in lost opportunities for both internal and external entities to discover new connections and nurture research collaboration.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "To solve this problem, we have developed PeopleMap, the first interactive, open-source, web-based tool that visually “maps out”researchers based on their research interests and publications by leveraging embeddings generated by natural language processing (NLP) techniques. PeopleMap provides a new engaging way for institutions to summarize their research talents and for people to discover new connections. PeopleMap is developed with ease-of-use and sustainability in mind. Using only researchers’ Google Scholar profiles as input, PeopleMap can be readily adopted by any institution using its publicly-accessible repository and detailed documentation.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "To access the Github repository for PeopleMap, click the following link:";
    			t7 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "PeopleMap Repository";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "To access the documentation for PeopleMap, click the following link:";
    			t11 = space();
    			ul1 = element("ul");
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "PeopleMap Documentation";
    			attr_dev(h1, "class", "text is-size-1");
    			add_location(h1, file$3, 12, 2, 275);
    			attr_dev(p0, "class", "text is-size-5");
    			add_location(p0, file$3, 13, 2, 331);
    			attr_dev(p1, "class", "text is-size-5");
    			add_location(p1, file$3, 15, 2, 848);
    			attr_dev(p2, "class", "text is-size-5");
    			add_location(p2, file$3, 17, 2, 1542);
    			attr_dev(a0, "href", "https://github.com/poloclub/people-map");
    			attr_dev(a0, "target", "_blank");
    			set_style(a0, "color", "#652DC1");
    			add_location(a0, file$3, 20, 9, 1691);
    			add_location(li0, file$3, 20, 4, 1686);
    			attr_dev(ul0, "class", "text is-size-5");
    			add_location(ul0, file$3, 19, 2, 1653);
    			attr_dev(p3, "class", "text is-size-5");
    			add_location(p3, file$3, 23, 2, 1828);
    			attr_dev(a1, "href", "https://app.gitbook.com/@poloclub/s/people-map/");
    			attr_dev(a1, "target", "_blank");
    			set_style(a1, "color", "#652DC1");
    			add_location(a1, file$3, 26, 9, 1973);
    			add_location(li1, file$3, 26, 4, 1968);
    			attr_dev(ul1, "class", "text is-size-5");
    			add_location(ul1, file$3, 25, 2, 1935);
    			attr_dev(div, "class", "content svelte-6qigj7");
    			add_location(div, file$3, 11, 0, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(div, t7);
    			append_dev(div, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(div, t9);
    			append_dev(div, p3);
    			append_dev(div, t11);
    			append_dev(div, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SummaryView> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SummaryView", $$slots, []);
    	return [];
    }

    class SummaryView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SummaryView",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\ToggleRow.svelte generated by Svelte v3.20.1 */

    const file$4 = "src\\components\\ToggleRow.svelte";

    function create_fragment$4(ctx) {
    	let div14;
    	let nav;
    	let div13;
    	let div0;
    	let p0;
    	let t1;
    	let div5;
    	let div4;
    	let div1;
    	let button0;
    	let span0;
    	let t2;
    	let t3;
    	let span1;
    	let i0;
    	let t4;
    	let div3;
    	let div2;
    	let a0;
    	let p1;
    	let t6;
    	let hr0;
    	let t7;
    	let a1;
    	let p2;
    	let div4_class_value;
    	let t9;
    	let div6;
    	let p3;
    	let t11;
    	let div11;
    	let div10;
    	let div7;
    	let button1;
    	let span2;
    	let t12_value = displayAdjective(/*$visKeywordEmphasis*/ ctx[3]) + "";
    	let t12;
    	let t13;
    	let span3;
    	let i1;
    	let t14;
    	let div9;
    	let div8;
    	let a2;
    	let p4;
    	let t16;
    	let hr1;
    	let t17;
    	let a3;
    	let p5;
    	let t19;
    	let hr2;
    	let t20;
    	let a4;
    	let p6;
    	let t22;
    	let hr3;
    	let t23;
    	let a5;
    	let p7;
    	let div10_class_value;
    	let t25;
    	let div12;
    	let p8;
    	let dispose;

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			nav = element("nav");
    			div13 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Create map based on";
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t2 = text(/*$datasetChoice*/ ctx[2]);
    			t3 = space();
    			span1 = element("span");
    			i0 = element("i");
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			a0 = element("a");
    			p1 = element("p");
    			p1.textContent = "Most Cited Publications";
    			t6 = space();
    			hr0 = element("hr");
    			t7 = space();
    			a1 = element("a");
    			p2 = element("p");
    			p2.textContent = "Most Recent Publications";
    			t9 = space();
    			div6 = element("div");
    			p3 = element("p");
    			p3.textContent = "with";
    			t11 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div7 = element("div");
    			button1 = element("button");
    			span2 = element("span");
    			t12 = text(t12_value);
    			t13 = space();
    			span3 = element("span");
    			i1 = element("i");
    			t14 = space();
    			div9 = element("div");
    			div8 = element("div");
    			a2 = element("a");
    			p4 = element("p");
    			p4.textContent = "No";
    			t16 = space();
    			hr1 = element("hr");
    			t17 = space();
    			a3 = element("a");
    			p5 = element("p");
    			p5.textContent = "Mild";
    			t19 = space();
    			hr2 = element("hr");
    			t20 = space();
    			a4 = element("a");
    			p6 = element("p");
    			p6.textContent = "Moderate";
    			t22 = space();
    			hr3 = element("hr");
    			t23 = space();
    			a5 = element("a");
    			p7 = element("p");
    			p7.textContent = "Strong";
    			t25 = space();
    			div12 = element("div");
    			p8 = element("p");
    			p8.textContent = "emphasis on people's research areas specified on Google Scholar.";
    			attr_dev(p0, "class", "text has-text-white");
    			set_style(p0, "font-size", "20px");
    			set_style(p0, "padding-left", "20px");
    			set_style(p0, "margin-right", "0px");
    			set_style(p0, "padding-right", "8px");
    			add_location(p0, file$4, 59, 10, 1508);
    			attr_dev(div0, "class", "level-item");
    			set_style(div0, "margin-right", "0px");
    			add_location(div0, file$4, 58, 8, 1446);
    			set_style(span0, "color", "white");
    			set_style(span0, "font-size", "20px");
    			add_location(span0, file$4, 67, 18, 2283);
    			attr_dev(i0, "class", "fas fa-angle-up fa-2x");
    			set_style(i0, "color", "white");
    			set_style(i0, "padding-left", "3px");
    			set_style(i0, "padding-right", "8px");
    			attr_dev(i0, "aria-hidden", "true");
    			add_location(i0, file$4, 69, 20, 2449);
    			attr_dev(span1, "class", "icon is-small");
    			set_style(span1, "padding-right", "5px");
    			add_location(span1, file$4, 68, 18, 2371);
    			attr_dev(button0, "class", "button");
    			set_style(button0, "background-color", "#8B72BE");
    			set_style(button0, "border", "0px solid white");
    			set_style(button0, "border-radius", "15px");
    			set_style(button0, "padding-left", "6px");
    			set_style(button0, "padding-right", "6px");
    			attr_dev(button0, "aria-haspopup", "true");
    			attr_dev(button0, "aria-controls", "dropdown-menu");
    			add_location(button0, file$4, 66, 16, 2021);
    			attr_dev(div1, "class", "dropdown-trigger");
    			set_style(div1, "background-color", "#8B72BE");
    			set_style(div1, "border-radius", "10px");
    			add_location(div1, file$4, 65, 14, 1917);
    			set_style(p1, "color", "white");
    			set_style(p1, "font-size", "15px");
    			set_style(p1, "background", "#8B72BE");
    			add_location(p1, file$4, 77, 20, 2984);
    			attr_dev(a0, "class", "dropdown-item svelte-11f3rkj");
    			set_style(a0, "background", "#8B72BE");
    			add_location(a0, file$4, 76, 18, 2835);
    			attr_dev(hr0, "class", "dropdown-divider");
    			add_location(hr0, file$4, 79, 18, 3118);
    			set_style(p2, "color", "white");
    			set_style(p2, "font-size", "15px");
    			set_style(p2, "background", "#8B72BE");
    			add_location(p2, file$4, 81, 20, 3317);
    			attr_dev(a1, "class", "dropdown-item svelte-11f3rkj");
    			set_style(a1, "background", "#8B72BE");
    			add_location(a1, file$4, 80, 18, 3167);
    			attr_dev(div2, "class", "dropdown-content");
    			set_style(div2, "background-color", "#8B72BE");
    			add_location(div2, file$4, 75, 16, 2750);
    			attr_dev(div3, "class", "dropdown-menu");
    			attr_dev(div3, "id", "dropdown-menu");
    			attr_dev(div3, "role", "menu");
    			add_location(div3, file$4, 74, 14, 2674);
    			attr_dev(div4, "class", div4_class_value = "dropdown is-up " + (/*dropdownShownDataset*/ ctx[0] ? "is-active" : ""));
    			set_style(div4, "padding-left", "2%");
    			add_location(div4, file$4, 64, 12, 1805);
    			attr_dev(div5, "class", "level-item");
    			set_style(div5, "overflow", "visible");
    			set_style(div5, "margin-right", "0px");
    			set_style(div5, "padding-right", "8px");
    			add_location(div5, file$4, 63, 8, 1701);
    			attr_dev(p3, "class", "text has-text-white");
    			set_style(p3, "font-size", "20px");
    			add_location(p3, file$4, 88, 10, 3609);
    			attr_dev(div6, "class", "level-item");
    			set_style(div6, "margin-right", "0px");
    			set_style(div6, "padding-right", "8px");
    			add_location(div6, file$4, 87, 8, 3526);
    			set_style(span2, "color", "white");
    			set_style(span2, "font-size", "20px");
    			add_location(span2, file$4, 96, 18, 4311);
    			attr_dev(i1, "class", "fas fa-angle-up fa-2x");
    			set_style(i1, "color", "white");
    			set_style(i1, "padding-left", "3px");
    			set_style(i1, "padding-right", "8px");
    			attr_dev(i1, "aria-hidden", "true");
    			add_location(i1, file$4, 98, 20, 4501);
    			attr_dev(span3, "class", "icon is-medium");
    			set_style(span3, "padding-right", "5px");
    			add_location(span3, file$4, 97, 18, 4422);
    			attr_dev(button1, "class", "button");
    			attr_dev(button1, "aria-haspopup", "true");
    			set_style(button1, "background-color", "#8B72BE");
    			set_style(button1, "border", "0px solid white");
    			set_style(button1, "border-radius", "15px");
    			set_style(button1, "padding-left", "6px");
    			set_style(button1, "padding-right", "6px");
    			attr_dev(button1, "aria-controls", "dropdown-menu");
    			add_location(button1, file$4, 95, 16, 4048);
    			attr_dev(div7, "class", "dropdown-trigger");
    			set_style(div7, "background-color", "#8B72BE");
    			set_style(div7, "border-radius", "10px");
    			add_location(div7, file$4, 94, 14, 3944);
    			set_style(p4, "color", "white");
    			set_style(p4, "font-size", "15px");
    			set_style(p4, "background", "#8B72BE");
    			add_location(p4, file$4, 106, 20, 5027);
    			attr_dev(a2, "class", "dropdown-item svelte-11f3rkj");
    			set_style(a2, "background", "#8B72BE");
    			add_location(a2, file$4, 105, 18, 4901);
    			attr_dev(hr1, "class", "dropdown-divider");
    			add_location(hr1, file$4, 108, 18, 5140);
    			set_style(p5, "color", "white");
    			set_style(p5, "font-size", "15px");
    			set_style(p5, "background", "#8B72BE");
    			add_location(p5, file$4, 110, 20, 5315);
    			attr_dev(a3, "class", "dropdown-item svelte-11f3rkj");
    			set_style(a3, "background", "#8B72BE");
    			add_location(a3, file$4, 109, 18, 5189);
    			attr_dev(hr2, "class", "dropdown-divider");
    			add_location(hr2, file$4, 112, 18, 5431);
    			set_style(p6, "color", "white");
    			set_style(p6, "font-size", "15px");
    			set_style(p6, "background", "#8B72BE");
    			add_location(p6, file$4, 114, 20, 5606);
    			attr_dev(a4, "class", "dropdown-item svelte-11f3rkj");
    			set_style(a4, "background", "#8B72BE");
    			add_location(a4, file$4, 113, 18, 5480);
    			attr_dev(hr3, "class", "dropdown-divider");
    			add_location(hr3, file$4, 116, 18, 5726);
    			set_style(p7, "color", "white");
    			set_style(p7, "font-size", "15px");
    			set_style(p7, "background", "#8B72BE");
    			add_location(p7, file$4, 118, 20, 5901);
    			attr_dev(a5, "class", "dropdown-item svelte-11f3rkj");
    			set_style(a5, "background", "#8B72BE");
    			add_location(a5, file$4, 117, 18, 5775);
    			attr_dev(div8, "class", "dropdown-content");
    			set_style(div8, "background-color", "#8B72BE");
    			set_style(div8, "width", "150px");
    			add_location(div8, file$4, 104, 16, 4802);
    			attr_dev(div9, "class", "dropdown-menu");
    			attr_dev(div9, "id", "dropdown-menu");
    			attr_dev(div9, "role", "menu");
    			add_location(div9, file$4, 103, 14, 4726);
    			attr_dev(div10, "class", div10_class_value = "dropdown is-up " + (/*dropdownShownEmphasis*/ ctx[1] ? "is-active" : ""));
    			set_style(div10, "padding-left", "2%");
    			add_location(div10, file$4, 93, 12, 3831);
    			attr_dev(div11, "class", "level-item");
    			set_style(div11, "overflow", "visible");
    			set_style(div11, "margin-right", "0px");
    			set_style(div11, "padding-right", "8px");
    			add_location(div11, file$4, 92, 8, 3727);
    			attr_dev(p8, "class", "text has-text-white");
    			set_style(p8, "font-size", "20px");
    			add_location(p8, file$4, 125, 10, 6129);
    			attr_dev(div12, "class", "level-item");
    			add_location(div12, file$4, 124, 8, 6093);
    			attr_dev(div13, "class", "level-left");
    			add_location(div13, file$4, 57, 6, 1412);
    			attr_dev(nav, "class", "level is-mobile svelte-11f3rkj");
    			set_style(nav, "padding", "10px 10px");
    			set_style(nav, "margin-bottom", "0px");
    			set_style(nav, "width", "1340px");
    			set_style(nav, "margin-left", "auto");
    			set_style(nav, "margin-right", "auto");
    			add_location(nav, file$4, 55, 4, 1273);
    			set_style(div14, "background-color", "#652DC1");
    			add_location(div14, file$4, 53, 0, 1225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, nav);
    			append_dev(nav, div13);
    			append_dev(div13, div0);
    			append_dev(div0, p0);
    			append_dev(div13, t1);
    			append_dev(div13, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, button0);
    			append_dev(button0, span0);
    			append_dev(span0, t2);
    			append_dev(button0, t3);
    			append_dev(button0, span1);
    			append_dev(span1, i0);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, a0);
    			append_dev(a0, p1);
    			append_dev(div2, t6);
    			append_dev(div2, hr0);
    			append_dev(div2, t7);
    			append_dev(div2, a1);
    			append_dev(a1, p2);
    			append_dev(div13, t9);
    			append_dev(div13, div6);
    			append_dev(div6, p3);
    			append_dev(div13, t11);
    			append_dev(div13, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, button1);
    			append_dev(button1, span2);
    			append_dev(span2, t12);
    			append_dev(button1, t13);
    			append_dev(button1, span3);
    			append_dev(span3, i1);
    			append_dev(div10, t14);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, a2);
    			append_dev(a2, p4);
    			append_dev(div8, t16);
    			append_dev(div8, hr1);
    			append_dev(div8, t17);
    			append_dev(div8, a3);
    			append_dev(a3, p5);
    			append_dev(div8, t19);
    			append_dev(div8, hr2);
    			append_dev(div8, t20);
    			append_dev(div8, a4);
    			append_dev(a4, p6);
    			append_dev(div8, t22);
    			append_dev(div8, hr3);
    			append_dev(div8, t23);
    			append_dev(div8, a5);
    			append_dev(a5, p7);
    			append_dev(div13, t25);
    			append_dev(div13, div12);
    			append_dev(div12, p8);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[6], false, false, false),
    				listen_dev(a0, "click", /*click_handler_1*/ ctx[7], false, false, false),
    				listen_dev(a1, "click", /*click_handler_2*/ ctx[8], false, false, false),
    				listen_dev(button1, "click", /*click_handler_3*/ ctx[9], false, false, false),
    				listen_dev(a2, "click", /*click_handler_4*/ ctx[10], false, false, false),
    				listen_dev(a3, "click", /*click_handler_5*/ ctx[11], false, false, false),
    				listen_dev(a4, "click", /*click_handler_6*/ ctx[12], false, false, false),
    				listen_dev(a5, "click", /*click_handler_7*/ ctx[13], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$datasetChoice*/ 4) set_data_dev(t2, /*$datasetChoice*/ ctx[2]);

    			if (dirty & /*dropdownShownDataset*/ 1 && div4_class_value !== (div4_class_value = "dropdown is-up " + (/*dropdownShownDataset*/ ctx[0] ? "is-active" : ""))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (dirty & /*$visKeywordEmphasis*/ 8 && t12_value !== (t12_value = displayAdjective(/*$visKeywordEmphasis*/ ctx[3]) + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*dropdownShownEmphasis*/ 2 && div10_class_value !== (div10_class_value = "dropdown is-up " + (/*dropdownShownEmphasis*/ ctx[1] ? "is-active" : ""))) {
    				attr_dev(div10, "class", div10_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function displayAdjective(number) {
    	if (number == 0) {
    		return "No";
    	} else if (number == 1) {
    		return "Mild";
    	} else if (number == 3) {
    		return "Moderate";
    	} else if (number == 5) {
    		return "Strong";
    	} else {
    		return "Not labeled";
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $datasetChoice;
    	let $visKeywordEmphasis;
    	validate_store(datasetChoice, "datasetChoice");
    	component_subscribe($$self, datasetChoice, $$value => $$invalidate(2, $datasetChoice = $$value));
    	validate_store(visKeywordEmphasis, "visKeywordEmphasis");
    	component_subscribe($$self, visKeywordEmphasis, $$value => $$invalidate(3, $visKeywordEmphasis = $$value));
    	var dropdownShownDataset = false;
    	var dropdownShownEmphasis = false;

    	const selectionClickedDataset = selection => {
    		$$invalidate(0, dropdownShownDataset = !dropdownShownDataset);

    		if (selection) {
    			datasetChoice.set(selection);
    		}
    	};

    	const selectionClickedEmphasis = selection => {
    		var adjustedSelection = selection + 1;
    		$$invalidate(1, dropdownShownEmphasis = !dropdownShownEmphasis);

    		if (adjustedSelection) {
    			visKeywordEmphasis.set(adjustedSelection - 1);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToggleRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ToggleRow", $$slots, []);

    	const click_handler = () => {
    		selectionClickedDataset();
    	};

    	const click_handler_1 = () => {
    		selectionClickedDataset("Most Cited Publications");
    	};

    	const click_handler_2 = () => {
    		selectionClickedDataset("Most Recent Publications");
    	};

    	const click_handler_3 = () => {
    		selectionClickedEmphasis();
    	};

    	const click_handler_4 = () => {
    		selectionClickedEmphasis(0);
    	};

    	const click_handler_5 = () => {
    		selectionClickedEmphasis(1);
    	};

    	const click_handler_6 = () => {
    		selectionClickedEmphasis(3);
    	};

    	const click_handler_7 = () => {
    		selectionClickedEmphasis(5);
    	};

    	$$self.$capture_state = () => ({
    		queryKeywordEmphasis,
    		visKeywordEmphasis,
    		visNumClusters,
    		displayNames,
    		displayDistributions,
    		datasetChoice,
    		dropdownShownDataset,
    		dropdownShownEmphasis,
    		selectionClickedDataset,
    		selectionClickedEmphasis,
    		displayAdjective,
    		$datasetChoice,
    		$visKeywordEmphasis
    	});

    	$$self.$inject_state = $$props => {
    		if ("dropdownShownDataset" in $$props) $$invalidate(0, dropdownShownDataset = $$props.dropdownShownDataset);
    		if ("dropdownShownEmphasis" in $$props) $$invalidate(1, dropdownShownEmphasis = $$props.dropdownShownEmphasis);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dropdownShownDataset,
    		dropdownShownEmphasis,
    		$datasetChoice,
    		$visKeywordEmphasis,
    		selectionClickedDataset,
    		selectionClickedEmphasis,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7
    	];
    }

    class ToggleRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleRow",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.20.1 */
    const file$5 = "src\\App.svelte";

    function create_fragment$5(ctx) {
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let t2;
    	let t3;
    	let current;
    	const statsview = new StatsView({ $$inline: true });
    	const peoplemapview = new PeopleMapView({ $$inline: true });
    	const researcherdetailview = new ResearcherDetailView({ $$inline: true });
    	const togglerow = new ToggleRow({ $$inline: true });
    	const summaryview = new SummaryView({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(statsview.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			create_component(peoplemapview.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(researcherdetailview.$$.fragment);
    			t2 = space();
    			create_component(togglerow.$$.fragment);
    			t3 = space();
    			create_component(summaryview.$$.fragment);
    			attr_dev(div0, "class", "column");
    			set_style(div0, "min-height", "625px");
    			set_style(div0, "padding-bottom", "35px");
    			set_style(div0, "margin-bottom", "0px");
    			set_style(div0, "background", "#FFFFFF");
    			set_style(div0, "padding-right", "0px");
    			set_style(div0, "padding-left", "0px");
    			set_style(div0, "margin-left", "0px");
    			set_style(div0, "margin-right", "0px");
    			set_style(div0, "width", "100%");
    			set_style(div0, "padding-top", "0px");
    			add_location(div0, file$5, 21, 2, 780);
    			attr_dev(div1, "class", "level-item");
    			set_style(div1, "width", "400px");
    			add_location(div1, file$5, 25, 4, 1111);
    			attr_dev(div2, "class", "column is-narrow");
    			set_style(div2, "padding-right", "20px");
    			set_style(div2, "margin", "0px");
    			add_location(div2, file$5, 24, 2, 1034);
    			attr_dev(div3, "class", "columns is-mobile svelte-w7m31u");
    			set_style(div3, "margin-top", "0px");
    			set_style(div3, "padding-top", "0px");
    			set_style(div3, "margin-bottom", "0px");
    			set_style(div3, "padding-left", "0px");
    			set_style(div3, "padding-right", "0px");
    			set_style(div3, "min-width", "1300px");
    			set_style(div3, "width", "1340px");
    			set_style(div3, "margin-left", "auto");
    			set_style(div3, "margin-right", "auto");
    			add_location(div3, file$5, 20, 0, 572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(statsview, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(peoplemapview, div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(researcherdetailview, div1, null);
    			insert_dev(target, t2, anchor);
    			mount_component(togglerow, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(summaryview, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statsview.$$.fragment, local);
    			transition_in(peoplemapview.$$.fragment, local);
    			transition_in(researcherdetailview.$$.fragment, local);
    			transition_in(togglerow.$$.fragment, local);
    			transition_in(summaryview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statsview.$$.fragment, local);
    			transition_out(peoplemapview.$$.fragment, local);
    			transition_out(researcherdetailview.$$.fragment, local);
    			transition_out(togglerow.$$.fragment, local);
    			transition_out(summaryview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(statsview, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_component(peoplemapview);
    			destroy_component(researcherdetailview);
    			if (detaching) detach_dev(t2);
    			destroy_component(togglerow, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(summaryview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		PeopleMapView,
    		ResearcherDetailView,
    		StatsView,
    		SummaryView,
    		ToggleRow
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
