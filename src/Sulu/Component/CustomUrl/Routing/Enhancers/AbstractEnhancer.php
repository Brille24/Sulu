<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\CustomUrl\Routing\Enhancers;

use Sulu\Component\CustomUrl\Document\CustomUrlBehavior;
use Sulu\Component\Webspace\Webspace;
use Symfony\Cmf\Component\Routing\Enhancer\RouteEnhancerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Abstract class for all custom-url route enhancers.
 */
abstract class AbstractEnhancer implements RouteEnhancerInterface
{
    public function enhance(array $defaults, Request $request): array
    {
        if ((\array_key_exists('_finalized', $defaults) && true === $defaults['_finalized'])
            || !$this->supports($defaults['_custom_url'])
        ) {
            return $defaults;
        }

        return \array_merge(
            $defaults,
            $this->doEnhance($defaults['_custom_url'], $defaults['_webspace'], $defaults, $request)
        );
    }

    /**
     * Returns default for given custom-url.
     *
     * @return array
     */
    abstract protected function doEnhance(
        CustomUrlBehavior $customUrl,
        Webspace $webspace,
        array $defaults,
        Request $request
    );

    /**
     * Returns true if enhancer supports given custom-url.
     *
     * @return bool
     */
    protected function supports(CustomUrlBehavior $customUrl)
    {
        return true;
    }
}
